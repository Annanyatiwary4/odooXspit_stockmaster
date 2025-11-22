import Product from "../models/product.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Generate unique SKU
const generateSKU = async (category) => {
  // Get category prefix (first 3 letters, uppercase)
  const categoryPrefix = category
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X'); // Pad with X if less than 3 chars

  // Find the highest number for this category prefix
  const productsWithPrefix = await Product.find({
    sku: { $regex: `^${categoryPrefix}-` }
  }).sort({ sku: -1 }).limit(1);

  let nextNumber = 1;
  if (productsWithPrefix.length > 0) {
    const lastSKU = productsWithPrefix[0].sku;
    const lastNumber = parseInt(lastSKU.split('-')[1]) || 0;
    nextNumber = lastNumber + 1;
  }

  // Format: CAT-0001
  const sku = `${categoryPrefix}-${String(nextNumber).padStart(4, '0')}`;
  
  // Ensure uniqueness (in case of race condition)
  const exists = await Product.findOne({ sku });
  if (exists) {
    // If exists, try next number
    return `${categoryPrefix}-${String(nextNumber + 1).padStart(4, '0')}`;
  }

  return sku;
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin, Manager)
export const createProduct = async (req, res) => {
  try {
    const { name, sku, category, uom, description, reorderLevel, reorderQuantity, maxStock } = req.body;

    if (!name || !category || !uom) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, category, and UOM",
      });
    }

    let finalSKU = sku;

    // Auto-generate SKU if not provided
    if (!finalSKU || finalSKU.trim() === '') {
      finalSKU = await generateSKU(category);
    } else {
      finalSKU = finalSKU.toUpperCase();
      
      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku: finalSKU });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }
    }

    const product = await Product.create({
      name,
      sku: finalSKU,
      category,
      uom,
      description: description || "",
      reorderLevel: reorderLevel || 5,
      reorderQuantity: reorderQuantity || 10,
      maxStock: maxStock || null,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Manager)
export const updateProduct = async (req, res) => {
  try {
    const { name, sku, category, uom, description, reorderLevel, reorderQuantity, maxStock, status } = req.body;

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if SKU is being changed and if it already exists
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }
    }

    // Update fields
    if (name) product.name = name;
    if (sku) product.sku = sku.toUpperCase();
    if (category) product.category = category;
    if (uom) product.uom = uom;
    if (description !== undefined) product.description = description;
    if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;
    if (reorderQuantity !== undefined) product.reorderQuantity = reorderQuantity;
    if (maxStock !== undefined) product.maxStock = maxStock;
    if (status) product.status = status;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update stock per location
// @route   PUT /api/products/:id/stock
// @access  Private (Admin, Manager)
export const updateStock = async (req, res) => {
  try {
    const { locationId, quantity } = req.body;

    if (!locationId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide locationId and quantity",
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update stock by location
    const currentStock = product.stockByLocation.get(locationId) || 0;
    product.stockByLocation.set(locationId, quantity);
    
    // Recalculate total stock
    let totalStock = 0;
    product.stockByLocation.forEach((stock) => {
      totalStock += stock;
    });
    product.totalStock = totalStock;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

