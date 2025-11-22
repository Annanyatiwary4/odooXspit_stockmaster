import Adjustment from "../models/adjustment.js";
import Product from "../models/product.js";
import Warehouse from "../models/warehouse.js";
import { logStockMovement } from "../utils/stockLedger.js";

// Helper function to generate adjustment number
const generateAdjustmentNumber = async () => {
  const count = await Adjustment.countDocuments();
  return `ADJ-${String(count + 1).padStart(6, '0')}`;
};

// Helper function to update product stock
const updateProductStock = async (productId, locationId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  product.stockByLocation.set(locationId, quantity);
  
  // Recalculate total stock
  let totalStock = 0;
  product.stockByLocation.forEach((stock) => {
    totalStock += stock;
  });
  product.totalStock = totalStock;

  await product.save();
  return product;
};

// @desc    Get all adjustments
// @route   GET /api/adjustments
// @access  Private
export const getAdjustments = async (req, res) => {
  try {
    const { status, productId, warehouseId, adjustmentType, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // For warehouse staff, filter by assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      query.warehouseId = req.user.assignedWarehouse;
    } else if (warehouseId) {
      query.warehouseId = warehouseId;
    }
    
    if (status) query.status = status;
    if (productId) query.productId = productId;
    if (adjustmentType) query.adjustmentType = adjustmentType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const adjustments = await Adjustment.find(query)
      .populate('productId', 'name sku uom')
      .populate('warehouseId', 'name code')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Adjustment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: adjustments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get adjustments error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get adjustment by ID
// @route   GET /api/adjustments/:id
// @access  Private
export const getAdjustment = async (req, res) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id)
      .populate('productId', 'name sku uom')
      .populate('warehouseId', 'name code locations')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    // For warehouse staff, ensure they can only view adjustments from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const adjustmentWarehouseId = adjustment.warehouseId._id || adjustment.warehouseId;
      if (assignedWarehouseId.toString() !== adjustmentWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only view adjustments from your assigned warehouse",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    console.error("Get adjustment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Create adjustment
// @route   POST /api/adjustments
// @access  Private (Admin, Manager, Warehouse)
export const createAdjustment = async (req, res) => {
  try {
    const {
      productId,
      warehouseId,
      locationId,
      countedQuantity,
      adjustmentType,
      reason,
      adjustmentDate,
      notes
    } = req.body;

    if (!productId || !warehouseId || !locationId || countedQuantity === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide product, warehouse, location, counted quantity, and reason",
      });
    }

    // For warehouse staff, enforce assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      if (assignedWarehouseId.toString() !== warehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only create adjustments for your assigned warehouse",
        });
      }
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Verify warehouse exists
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // Verify location exists in warehouse
    const location = warehouse.locations.find(loc => loc._id.toString() === locationId);
    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location not found in warehouse",
      });
    }

    // Get current system quantity
    const systemQuantity = product.stockByLocation.get(locationId) || 0;
    const difference = countedQuantity - systemQuantity;

    const adjustmentNumber = await generateAdjustmentNumber();

    const adjustment = await Adjustment.create({
      adjustmentNumber,
      productId,
      warehouseId,
      locationId,
      systemQuantity,
      countedQuantity,
      difference,
      adjustmentType: adjustmentType || 'correction',
      reason,
      adjustmentDate: adjustmentDate ? new Date(adjustmentDate) : new Date(),
      notes: notes || "",
      createdBy: req.user._id,
      status: 'draft'
    });

    const populatedAdjustment = await Adjustment.findById(adjustment._id)
      .populate('productId', 'name sku uom')
      .populate('warehouseId', 'name code')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedAdjustment,
    });
  } catch (error) {
    console.error("Create adjustment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update adjustment
// @route   PUT /api/adjustments/:id
// @access  Private (Admin, Manager)
export const updateAdjustment = async (req, res) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id);
    
    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    // For warehouse staff, ensure they can only update adjustments from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const adjustmentWarehouseId = adjustment.warehouseId._id || adjustment.warehouseId;
      if (assignedWarehouseId.toString() !== adjustmentWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update adjustments from your assigned warehouse",
        });
      }
    }

    // Cannot update validated adjustments
    if (adjustment.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Cannot update validated adjustment",
      });
    }

    const {
      countedQuantity,
      adjustmentType,
      reason,
      adjustmentDate,
      notes
    } = req.body;

    if (countedQuantity !== undefined) {
      adjustment.countedQuantity = countedQuantity;
      adjustment.difference = countedQuantity - adjustment.systemQuantity;
    }
    if (adjustmentType) adjustment.adjustmentType = adjustmentType;
    if (reason) adjustment.reason = reason;
    if (adjustmentDate) adjustment.adjustmentDate = new Date(adjustmentDate);
    if (notes !== undefined) adjustment.notes = notes;

    await adjustment.save();

    const populatedAdjustment = await Adjustment.findById(adjustment._id)
      .populate('productId', 'name sku uom')
      .populate('warehouseId', 'name code')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedAdjustment,
    });
  } catch (error) {
    console.error("Update adjustment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Validate adjustment (updates stock)
// @route   POST /api/adjustments/:id/validate
// @access  Private (Admin, Manager)
export const validateAdjustment = async (req, res) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id)
      .populate('warehouseId', 'name code locations');

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    // For warehouse staff, ensure they can only validate adjustments from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const adjustmentWarehouseId = adjustment.warehouseId._id || adjustment.warehouseId;
      if (assignedWarehouseId.toString() !== adjustmentWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only validate adjustments from your assigned warehouse",
        });
      }
    }

    if (adjustment.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Adjustment already validated",
      });
    }

    if (adjustment.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: "Cannot validate canceled adjustment",
      });
    }

    // Get quantity before adjustment
    const product = await Product.findById(adjustment.productId);
    const quantityBefore = product.stockByLocation.get(adjustment.locationId) || 0;
    const quantityChange = adjustment.difference; // Can be positive or negative

    // Update stock to counted quantity
    await updateProductStock(adjustment.productId, adjustment.locationId, adjustment.countedQuantity);

    // Get quantity after update
    const productAfter = await Product.findById(adjustment.productId);
    const quantityAfter = productAfter.stockByLocation.get(adjustment.locationId) || 0;

    // Log stock movement
    await logStockMovement({
      movementType: 'adjustment',
      documentId: adjustment._id,
      documentNumber: adjustment.adjustmentNumber,
      productId: adjustment.productId,
      warehouseId: adjustment.warehouseId,
      locationId: adjustment.locationId,
      quantity: quantityChange, // Use the actual difference for logging (can be positive or negative)
      reference: `${adjustment.adjustmentType}: ${adjustment.reason}`,
      notes: adjustment.notes || "",
      performedBy: req.user._id
    });

    // Update adjustment status
    adjustment.status = 'done';
    adjustment.validatedBy = req.user._id;
    adjustment.validatedAt = new Date();
    await adjustment.save();

    const populatedAdjustment = await Adjustment.findById(adjustment._id)
      .populate('productId', 'name sku uom')
      .populate('warehouseId', 'name code')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedAdjustment,
      message: "Adjustment validated and stock updated",
    });
  } catch (error) {
    console.error("Validate adjustment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Cancel adjustment
// @route   DELETE /api/adjustments/:id
// @access  Private (Admin, Manager)
export const cancelAdjustment = async (req, res) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id);
    
    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    // For warehouse staff, ensure they can only cancel adjustments from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const adjustmentWarehouseId = adjustment.warehouseId._id || adjustment.warehouseId;
      if (assignedWarehouseId.toString() !== adjustmentWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only cancel adjustments from your assigned warehouse",
        });
      }
    }

    if (adjustment.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel validated adjustment",
      });
    }

    adjustment.status = 'canceled';
    await adjustment.save();

    res.status(200).json({
      success: true,
      message: "Adjustment canceled",
    });
  } catch (error) {
    console.error("Cancel adjustment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

