import Transfer from "../models/transfer.js";
import Product from "../models/product.js";
import Warehouse from "../models/warehouse.js";
import { logStockMovement } from "../utils/stockLedger.js";

// Helper function to generate transfer number
const generateTransferNumber = async () => {
  const count = await Transfer.countDocuments();
  return `T-${String(count + 1).padStart(6, '0')}`;
};

// Helper function to update product stock
const updateProductStock = async (productId, locationId, quantity, operation = 'subtract') => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const currentStock = product.stockByLocation.get(locationId) || 0;
  
  if (operation === 'subtract') {
    if (currentStock < quantity) {
      throw new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`);
    }
    product.stockByLocation.set(locationId, currentStock - quantity);
  } else {
    product.stockByLocation.set(locationId, currentStock + quantity);
  }
  
  // Recalculate total stock
  let totalStock = 0;
  product.stockByLocation.forEach((stock) => {
    totalStock += stock;
  });
  product.totalStock = totalStock;

  await product.save();
  return product;
};

// @desc    Get all transfers
// @route   GET /api/transfers
// @access  Private
export const getTransfers = async (req, res) => {
  try {
    const { status, sourceWarehouseId, destinationWarehouseId, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // For warehouse staff, filter by assigned warehouse (both source and destination must be assigned warehouse)
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      query.sourceWarehouseId = assignedWarehouseId;
      query.destinationWarehouseId = assignedWarehouseId;
    } else {
      if (sourceWarehouseId) query.sourceWarehouseId = sourceWarehouseId;
      if (destinationWarehouseId) query.destinationWarehouseId = destinationWarehouseId;
    }
    
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transfers = await Transfer.find(query)
      .populate('sourceWarehouseId', 'name code')
      .populate('destinationWarehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email')
      .populate('executedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Transfer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transfers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get transfers error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get transfer by ID
// @route   GET /api/transfers/:id
// @access  Private
export const getTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('sourceWarehouseId', 'name code locations')
      .populate('destinationWarehouseId', 'name code locations')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email')
      .populate('executedBy', 'name email');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    // For warehouse staff, ensure they can only view transfers within their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const sourceWarehouseId = transfer.sourceWarehouseId._id || transfer.sourceWarehouseId;
      const destWarehouseId = transfer.destinationWarehouseId._id || transfer.destinationWarehouseId;
      if (assignedWarehouseId.toString() !== sourceWarehouseId.toString() || 
          assignedWarehouseId.toString() !== destWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only view transfers within your assigned warehouse",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    console.error("Get transfer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Create transfer
// @route   POST /api/transfers
// @access  Private (Admin, Manager, Warehouse)
export const createTransfer = async (req, res) => {
  try {
    const {
      sourceWarehouseId,
      sourceLocationId,
      destinationWarehouseId,
      destinationLocationId,
      items,
      transferDate,
      scheduledDate,
      reason,
      notes
    } = req.body;

    if (!sourceWarehouseId || !sourceLocationId || !destinationWarehouseId || !destinationLocationId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide source, destination, and items",
      });
    }

    // For warehouse staff, enforce assigned warehouse for both source and destination (must be same warehouse)
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      if (assignedWarehouseId.toString() !== sourceWarehouseId.toString() || 
          assignedWarehouseId.toString() !== destinationWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only create transfers within your assigned warehouse",
        });
      }
      // Ensure source and destination are the same warehouse for internal transfers
      if (sourceWarehouseId.toString() !== destinationWarehouseId.toString()) {
        return res.status(400).json({
          success: false,
          message: "As warehouse staff, you can only transfer within your assigned warehouse",
        });
      }
    }

    // Verify warehouses exist
    const sourceWarehouse = await Warehouse.findById(sourceWarehouseId);
    const destinationWarehouse = await Warehouse.findById(destinationWarehouseId);
    
    if (!sourceWarehouse) {
      return res.status(404).json({
        success: false,
        message: "Source warehouse not found",
      });
    }
    if (!destinationWarehouse) {
      return res.status(404).json({
        success: false,
        message: "Destination warehouse not found",
      });
    }

    // Verify locations exist
    const sourceLocation = sourceWarehouse.locations.find(loc => loc._id.toString() === sourceLocationId);
    const destinationLocation = destinationWarehouse.locations.find(loc => loc._id.toString() === destinationLocationId);
    
    if (!sourceLocation) {
      return res.status(400).json({
        success: false,
        message: "Source location not found in warehouse",
      });
    }
    if (!destinationLocation) {
      return res.status(400).json({
        success: false,
        message: "Destination location not found in warehouse",
      });
    }

    // Verify all products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }
      // Check stock availability at source
      const stock = product.stockByLocation.get(sourceLocationId) || 0;
      if (stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} at source location. Available: ${stock}, Requested: ${item.quantity}`,
        });
      }
    }

    const transferNumber = await generateTransferNumber();

    const transfer = await Transfer.create({
      transferNumber,
      sourceWarehouseId,
      sourceLocationId,
      destinationWarehouseId,
      destinationLocationId,
      items,
      transferDate: transferDate ? new Date(transferDate) : new Date(),
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      reason: reason || "",
      notes: notes || "",
      createdBy: req.user._id,
      status: 'draft'
    });

    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate('sourceWarehouseId', 'name code')
      .populate('destinationWarehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTransfer,
    });
  } catch (error) {
    console.error("Create transfer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update transfer
// @route   PUT /api/transfers/:id
// @access  Private (Admin, Manager)
export const updateTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    // For warehouse staff, ensure they can only update transfers within their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const sourceWarehouseId = transfer.sourceWarehouseId._id || transfer.sourceWarehouseId;
      const destWarehouseId = transfer.destinationWarehouseId._id || transfer.destinationWarehouseId;
      if (assignedWarehouseId.toString() !== sourceWarehouseId.toString() || 
          assignedWarehouseId.toString() !== destWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update transfers within your assigned warehouse",
        });
      }
    }

    // Cannot update executed transfers
    if (transfer.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Cannot update executed transfer",
      });
    }

    const {
      sourceWarehouseId,
      sourceLocationId,
      destinationWarehouseId,
      destinationLocationId,
      items,
      transferDate,
      scheduledDate,
      reason,
      notes,
      status
    } = req.body;

    if (sourceWarehouseId) {
      // For warehouse staff, enforce assigned warehouse
      if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
        const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
        if (assignedWarehouseId.toString() !== sourceWarehouseId.toString()) {
          return res.status(403).json({
            success: false,
            message: "You can only update transfers within your assigned warehouse",
          });
        }
      }
      const warehouse = await Warehouse.findById(sourceWarehouseId);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Source warehouse not found",
        });
      }
      transfer.sourceWarehouseId = sourceWarehouseId;
    }
    if (sourceLocationId) transfer.sourceLocationId = sourceLocationId;
    if (destinationWarehouseId) {
      // For warehouse staff, enforce assigned warehouse and ensure it matches source
      if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
        const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
        if (assignedWarehouseId.toString() !== destinationWarehouseId.toString()) {
          return res.status(403).json({
            success: false,
            message: "You can only update transfers within your assigned warehouse",
          });
        }
        // Ensure source and destination are the same warehouse for warehouse staff
        if (sourceWarehouseId && sourceWarehouseId.toString() !== destinationWarehouseId.toString()) {
          return res.status(400).json({
            success: false,
            message: "As warehouse staff, you can only transfer within your assigned warehouse",
          });
        }
      }
      const warehouse = await Warehouse.findById(destinationWarehouseId);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Destination warehouse not found",
        });
      }
      transfer.destinationWarehouseId = destinationWarehouseId;
    }
    if (destinationLocationId) transfer.destinationLocationId = destinationLocationId;
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
      transfer.items = items;
    }
    if (transferDate) transfer.transferDate = new Date(transferDate);
    if (scheduledDate !== undefined) transfer.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    if (reason !== undefined) transfer.reason = reason;
    if (notes !== undefined) transfer.notes = notes;
    if (status && ['draft', 'waiting', 'ready', 'canceled'].includes(status)) {
      transfer.status = status;
    }

    await transfer.save();

    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate('sourceWarehouseId', 'name code')
      .populate('destinationWarehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedTransfer,
    });
  } catch (error) {
    console.error("Update transfer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Execute transfer (updates stock)
// @route   POST /api/transfers/:id/execute
// @access  Private (Admin, Manager, Warehouse)
export const executeTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('sourceWarehouseId', 'name code locations')
      .populate('destinationWarehouseId', 'name code locations');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    // For warehouse staff, ensure they can only execute transfers within their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const sourceWarehouseId = transfer.sourceWarehouseId._id || transfer.sourceWarehouseId;
      const destWarehouseId = transfer.destinationWarehouseId._id || transfer.destinationWarehouseId;
      if (assignedWarehouseId.toString() !== sourceWarehouseId.toString() || 
          assignedWarehouseId.toString() !== destWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only execute transfers within your assigned warehouse",
        });
      }
    }

    if (transfer.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Transfer already executed",
      });
    }

    if (transfer.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: "Cannot execute canceled transfer",
      });
    }

    // Update stock: subtract from source, add to destination
    for (const item of transfer.items) {
      // Subtract from source location
      await updateProductStock(item.productId, transfer.sourceLocationId, item.quantity, 'subtract');
      // Add to destination location
      await updateProductStock(item.productId, transfer.destinationLocationId, item.quantity, 'add');
      
      // Log stock movement (logStockMovement handles both source and destination entries)
      await logStockMovement({
        movementType: 'transfer',
        documentId: transfer._id,
        documentNumber: transfer.transferNumber,
        productId: item.productId,
        warehouseId: transfer.sourceWarehouseId,
        locationId: transfer.sourceLocationId,
        quantity: item.quantity,
        sourceWarehouseId: transfer.sourceWarehouseId,
        sourceLocationId: transfer.sourceLocationId,
        destinationWarehouseId: transfer.destinationWarehouseId,
        destinationLocationId: transfer.destinationLocationId,
        reference: transfer.reason || "",
        notes: transfer.notes || "",
        performedBy: req.user._id
      });
    }

    // Update transfer status
    transfer.status = 'done';
    transfer.executedBy = req.user._id;
    transfer.executedAt = new Date();
    await transfer.save();

    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate('sourceWarehouseId', 'name code')
      .populate('destinationWarehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email')
      .populate('executedBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedTransfer,
      message: "Transfer executed and stock updated",
    });
  } catch (error) {
    console.error("Execute transfer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Cancel transfer
// @route   DELETE /api/transfers/:id
// @access  Private (Admin, Manager)
export const cancelTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    // For warehouse staff, ensure they can only cancel transfers within their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const sourceWarehouseId = transfer.sourceWarehouseId._id || transfer.sourceWarehouseId;
      const destWarehouseId = transfer.destinationWarehouseId._id || transfer.destinationWarehouseId;
      if (assignedWarehouseId.toString() !== sourceWarehouseId.toString() || 
          assignedWarehouseId.toString() !== destWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only cancel transfers within your assigned warehouse",
        });
      }
    }

    if (transfer.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel executed transfer",
      });
    }

    transfer.status = 'canceled';
    await transfer.save();

    res.status(200).json({
      success: true,
      message: "Transfer canceled",
    });
  } catch (error) {
    console.error("Cancel transfer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

