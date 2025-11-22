import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Product from "../models/product.js";
import Warehouse from "../models/warehouse.js";

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .populate('assignedWarehouse', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/admin/users
// @access  Private (Admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, assignedWarehouse } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and role",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      assignedWarehouse: assignedWarehouse || null,
    });

    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('assignedWarehouse', 'name code');

    res.status(201).json({
      success: true,
      data: populatedUser,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, assignedWarehouse, status } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (assignedWarehouse !== undefined) user.assignedWarehouse = assignedWarehouse;
    if (status) user.status = status;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('assignedWarehouse', 'name code');

    res.status(200).json({
      success: true,
      data: populatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Deactivate user (Admin only)
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private (Admin only)
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = 'inactive';
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get dashboard statistics (Admin only)
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments({ status: 'active' });
    
    // Low stock products (below reorder level)
    const lowStockProducts = await Product.find({
      status: 'active',
      $expr: { $lt: ['$totalStock', '$reorderLevel'] }
    }).countDocuments();
    
    // Out of stock products
    const outOfStockProducts = await Product.find({
      status: 'active',
      totalStock: 0
    }).countDocuments();
    
    // Total warehouses
    const totalWarehouses = await Warehouse.countDocuments({ status: 'active' });
    
    // Total users
    const totalUsers = await User.countDocuments({ status: 'active' });
    
    // Products by category
    const productsByCategory = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Total stock value (simplified - would need price field for actual value)
    const totalStockQuantity = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$totalStock' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalWarehouses,
        totalUsers,
        productsByCategory,
        totalStockQuantity: totalStockQuantity[0]?.total || 0
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

