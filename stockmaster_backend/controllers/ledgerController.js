import StockLedger from "../models/stockLedger.js";

// @desc    Get stock ledger (movement history)
// @route   GET /api/ledger
// @access  Private
export const getLedger = async (req, res) => {
  try {
    const { 
      movementType, 
      productId, 
      warehouseId, 
      locationId,
      startDate,
      endDate,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const query = {};
    
    // For warehouse staff, filter by assigned warehouse and show only their own movements
    if (req.user.role === 'warehouse') {
      if (req.user.assignedWarehouse) {
        query.$or = [
          { warehouseId: req.user.assignedWarehouse },
          { sourceWarehouseId: req.user.assignedWarehouse },
          { destinationWarehouseId: req.user.assignedWarehouse }
        ];
      }
      // Show only movements performed by this user
      query.performedBy = req.user._id;
    } else {
      if (warehouseId) query.warehouseId = warehouseId;
    }
    
    if (movementType) query.movementType = movementType;
    if (productId) query.productId = productId;
    if (locationId) query.locationId = locationId;
    
    // Date range filter
    if (startDate || endDate) {
      query.movementDate = {};
      if (startDate) {
        query.movementDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.movementDate.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const movements = await StockLedger.find(query)
      .populate('productId', 'name sku uom')
      .populate('warehouseId', 'name code')
      .populate('sourceWarehouseId', 'name code')
      .populate('destinationWarehouseId', 'name code')
      .populate('performedBy', 'name email')
      .sort({ movementDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await StockLedger.countDocuments(query);

    res.status(200).json({
      success: true,
      data: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get ledger error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get ledger by product
// @route   GET /api/ledger/product/:id
// @access  Private
export const getLedgerByProduct = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const query = { productId: req.params.id };
    
    if (startDate || endDate) {
      query.movementDate = {};
      if (startDate) query.movementDate.$gte = new Date(startDate);
      if (endDate) query.movementDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const movements = await StockLedger.find(query)
      .populate('warehouseId', 'name code')
      .populate('sourceWarehouseId', 'name code')
      .populate('destinationWarehouseId', 'name code')
      .populate('performedBy', 'name email')
      .sort({ movementDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await StockLedger.countDocuments(query);

    res.status(200).json({
      success: true,
      data: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get ledger by product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get ledger by warehouse
// @route   GET /api/ledger/warehouse/:id
// @access  Private
export const getLedgerByWarehouse = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const query = {
      $or: [
        { warehouseId: req.params.id },
        { sourceWarehouseId: req.params.id },
        { destinationWarehouseId: req.params.id }
      ]
    };
    
    if (startDate || endDate) {
      query.movementDate = {};
      if (startDate) query.movementDate.$gte = new Date(startDate);
      if (endDate) query.movementDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const movements = await StockLedger.find(query)
      .populate('productId', 'name sku uom')
      .populate('warehouseId', 'name code')
      .populate('sourceWarehouseId', 'name code')
      .populate('destinationWarehouseId', 'name code')
      .populate('performedBy', 'name email')
      .sort({ movementDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await StockLedger.countDocuments(query);

    res.status(200).json({
      success: true,
      data: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get ledger by warehouse error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

