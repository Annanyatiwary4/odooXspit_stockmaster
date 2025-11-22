import Receipt from "../models/receipt.js";
import Product from "../models/product.js";
import Warehouse from "../models/warehouse.js";
import { logStockMovement } from "../utils/stockLedger.js";

// Helper function to generate receipt number
const generateReceiptNumber = async () => {
  const count = await Receipt.countDocuments();
  return `R-${String(count + 1).padStart(6, '0')}`;
};

// Helper function to update product stock
const updateProductStock = async (productId, locationId, quantity, operation = 'add') => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const currentStock = product.stockByLocation.get(locationId) || 0;
  const newStock = operation === 'add' 
    ? currentStock + quantity 
    : Math.max(0, currentStock - quantity);
  
  product.stockByLocation.set(locationId, newStock);
  
  // Recalculate total stock
  let totalStock = 0;
  product.stockByLocation.forEach((stock) => {
    totalStock += stock;
  });
  product.totalStock = totalStock;

  await product.save();
  return product;
};

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Private
export const getReceipts = async (req, res) => {
  try {
    const { status, warehouseId, supplier, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // For warehouse staff, filter by assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      query.warehouseId = req.user.assignedWarehouse;
    } else if (warehouseId) {
      query.warehouseId = warehouseId;
    }
    
    if (status) query.status = status;
    if (supplier) query.supplier = { $regex: supplier, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const receipts = await Receipt.find(query)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Receipt.countDocuments(query);

    res.status(200).json({
      success: true,
      data: receipts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get receipts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get receipt by ID
// @route   GET /api/receipts/:id
// @access  Private
export const getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('warehouseId', 'name code locations')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // For warehouse staff, ensure they can only view receipts from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const receiptWarehouseId = receipt.warehouseId._id || receipt.warehouseId;
      if (assignedWarehouseId.toString() !== receiptWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only view receipts from your assigned warehouse",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error("Get receipt error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Create receipt
// @route   POST /api/receipts
// @access  Private (Admin, Manager, Warehouse)
export const createReceipt = async (req, res) => {
  try {
    const {
      supplier,
      supplierEmail,
      supplierPhone,
      warehouseId,
      items,
      receiptDate,
      expectedDate,
      referenceNumber,
      notes
    } = req.body;

    if (!supplier || !warehouseId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide supplier, warehouse, and items",
      });
    }

    // For warehouse staff, enforce assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      if (assignedWarehouseId.toString() !== warehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only create receipts for your assigned warehouse",
        });
      }
    }

    // Verify warehouse exists
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // Verify all products exist
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }
      // Verify location exists in warehouse
      const location = warehouse.locations.find(loc => loc._id.toString() === item.locationId);
      if (!location) {
        return res.status(400).json({
          success: false,
          message: `Location with ID ${item.locationId} not found in warehouse`,
        });
      }
    }

    const receiptNumber = await generateReceiptNumber();

    const receipt = await Receipt.create({
      receiptNumber,
      supplier,
      supplierEmail: supplierEmail || "",
      supplierPhone: supplierPhone || "",
      warehouseId,
      items,
      receiptDate: receiptDate ? new Date(receiptDate) : new Date(),
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      referenceNumber: referenceNumber || "",
      notes: notes || "",
      createdBy: req.user._id,
      status: 'draft'
    });

    const populatedReceipt = await Receipt.findById(receipt._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedReceipt,
    });
  } catch (error) {
    console.error("Create receipt error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Private (Admin, Manager)
export const updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // For warehouse staff, ensure they can only update receipts from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const receiptWarehouseId = receipt.warehouseId._id || receipt.warehouseId;
      if (assignedWarehouseId.toString() !== receiptWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update receipts from your assigned warehouse",
        });
      }
    }

    // Cannot update validated receipts
    if (receipt.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Cannot update validated receipt",
      });
    }

    const {
      supplier,
      supplierEmail,
      supplierPhone,
      warehouseId,
      items,
      receiptDate,
      expectedDate,
      referenceNumber,
      notes,
      status
    } = req.body;

    if (supplier) receipt.supplier = supplier;
    if (supplierEmail !== undefined) receipt.supplierEmail = supplierEmail;
    if (supplierPhone !== undefined) receipt.supplierPhone = supplierPhone;
    if (warehouseId) {
      // For warehouse staff, enforce assigned warehouse
      if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
        const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
        if (assignedWarehouseId.toString() !== warehouseId.toString()) {
          return res.status(403).json({
            success: false,
            message: "You can only update receipts for your assigned warehouse",
          });
        }
      }
      
      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Warehouse not found",
        });
      }
      receipt.warehouseId = warehouseId;
    }
    if (items && items.length > 0) {
      // Verify all products exist
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${item.productId} not found`,
          });
        }
      }
      receipt.items = items;
    }
    if (receiptDate) receipt.receiptDate = new Date(receiptDate);
    if (expectedDate !== undefined) receipt.expectedDate = expectedDate ? new Date(expectedDate) : null;
    if (referenceNumber !== undefined) receipt.referenceNumber = referenceNumber;
    if (notes !== undefined) receipt.notes = notes;
    if (status && ['draft', 'waiting', 'ready', 'canceled'].includes(status)) {
      receipt.status = status;
    }

    await receipt.save();

    const populatedReceipt = await Receipt.findById(receipt._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedReceipt,
    });
  } catch (error) {
    console.error("Update receipt error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Validate receipt (updates stock)
// @route   POST /api/receipts/:id/validate
// @access  Private (Admin, Manager)
export const validateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('warehouseId', 'name code locations');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    if (receipt.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Receipt already validated",
      });
    }

    if (receipt.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: "Cannot validate canceled receipt",
      });
    }

    // Update stock for each item and log movements
    for (const item of receipt.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      const quantityBefore = product.stockByLocation.get(item.locationId) || 0;
      
      await updateProductStock(item.productId, item.locationId, item.quantity, 'add');
      
      // Get warehouse ID (handle both populated and non-populated cases)
      const warehouseId = receipt.warehouseId._id || receipt.warehouseId;
      
      // Calculate quantity after
      const quantityAfter = quantityBefore + item.quantity;
      
      // Log stock movement with explicit quantities
      await logStockMovement({
        movementType: 'receipt',
        documentId: receipt._id,
        documentNumber: receipt.receiptNumber,
        productId: item.productId,
        warehouseId: warehouseId,
        locationId: item.locationId,
        quantity: item.quantity,
        quantityBefore: quantityBefore,
        quantityAfter: quantityAfter,
        reference: receipt.supplier,
        notes: receipt.notes || "",
        performedBy: req.user._id
      });
    }

    // Update receipt status
    receipt.status = 'done';
    receipt.validatedBy = req.user._id;
    receipt.validatedAt = new Date();
    await receipt.save();

    const populatedReceipt = await Receipt.findById(receipt._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedReceipt,
      message: "Receipt validated and stock updated",
    });
  } catch (error) {
    console.error("Validate receipt error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Cancel receipt
// @route   DELETE /api/receipts/:id
// @access  Private (Admin, Manager)
export const cancelReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    if (receipt.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel validated receipt",
      });
    }

    receipt.status = 'canceled';
    await receipt.save();

    res.status(200).json({
      success: true,
      message: "Receipt canceled",
    });
  } catch (error) {
    console.error("Cancel receipt error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

