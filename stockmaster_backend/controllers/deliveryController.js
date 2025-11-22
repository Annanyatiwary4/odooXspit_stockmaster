import Delivery from "../models/delivery.js";
import Product from "../models/product.js";
import Warehouse from "../models/warehouse.js";
import { logStockMovement } from "../utils/stockLedger.js";

// Helper function to generate delivery number
const generateDeliveryNumber = async () => {
  const count = await Delivery.countDocuments();
  return `D-${String(count + 1).padStart(6, '0')}`;
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

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private
export const getDeliveries = async (req, res) => {
  try {
    const { status, warehouseId, customer, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // For warehouse staff, filter by assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      query.warehouseId = req.user.assignedWarehouse;
    } else if (warehouseId) {
      query.warehouseId = warehouseId;
    }
    
    if (status) query.status = status;
    if (customer) query.customer = { $regex: customer, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const deliveries = await Delivery.find(query)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email')
      .populate('pickedBy', 'name email')
      .populate('packedBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Delivery.countDocuments(query);

    res.status(200).json({
      success: true,
      data: deliveries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get deliveries error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get delivery by ID
// @route   GET /api/deliveries/:id
// @access  Private
export const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('warehouseId', 'name code locations')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email')
      .populate('pickedBy', 'name email')
      .populate('packedBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // For warehouse staff, ensure they can only view deliveries from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const deliveryWarehouseId = delivery.warehouseId._id || delivery.warehouseId;
      if (assignedWarehouseId.toString() !== deliveryWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only view deliveries from your assigned warehouse",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error("Get delivery error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Create delivery order
// @route   POST /api/deliveries
// @access  Private (Admin, Manager)
export const createDelivery = async (req, res) => {
  try {
    const {
      customer,
      customerEmail,
      customerPhone,
      deliveryAddress,
      warehouseId,
      items,
      deliveryDate,
      expectedDeliveryDate,
      referenceNumber,
      notes
    } = req.body;

    if (!customer || !warehouseId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide customer, warehouse, and items",
      });
    }

    // For warehouse staff, enforce assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      if (assignedWarehouseId.toString() !== warehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only create deliveries for your assigned warehouse",
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

    // Verify all products exist and have sufficient stock
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
      // Check stock availability
      const stock = product.stockByLocation.get(item.locationId) || 0;
      if (stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${stock}, Requested: ${item.quantity}`,
        });
      }
    }

    const deliveryNumber = await generateDeliveryNumber();

    const delivery = await Delivery.create({
      deliveryNumber,
      customer,
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      deliveryAddress: deliveryAddress || "",
      warehouseId,
      items: items.map(item => ({
        ...item,
        pickedQuantity: 0,
        packedQuantity: 0
      })),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
      referenceNumber: referenceNumber || "",
      notes: notes || "",
      createdBy: req.user._id,
      status: 'draft'
    });

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedDelivery,
    });
  } catch (error) {
    console.error("Create delivery error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update delivery
// @route   PUT /api/deliveries/:id
// @access  Private (Admin, Manager)
export const updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // For warehouse staff, ensure they can only update deliveries from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const deliveryWarehouseId = delivery.warehouseId._id || delivery.warehouseId;
      if (assignedWarehouseId.toString() !== deliveryWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update deliveries from your assigned warehouse",
        });
      }
    }

    // Cannot update validated deliveries
    if (delivery.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Cannot update validated delivery",
      });
    }

    const {
      customer,
      customerEmail,
      customerPhone,
      deliveryAddress,
      warehouseId,
      items,
      deliveryDate,
      expectedDeliveryDate,
      referenceNumber,
      notes,
      status
    } = req.body;

    if (customer) delivery.customer = customer;
    if (customerEmail !== undefined) delivery.customerEmail = customerEmail;
    if (customerPhone !== undefined) delivery.customerPhone = customerPhone;
    if (deliveryAddress !== undefined) delivery.deliveryAddress = deliveryAddress;
    if (warehouseId) {
      // For warehouse staff, enforce assigned warehouse
      if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
        const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
        if (assignedWarehouseId.toString() !== warehouseId.toString()) {
          return res.status(403).json({
            success: false,
            message: "You can only update deliveries for your assigned warehouse",
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
      delivery.warehouseId = warehouseId;
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
      delivery.items = items.map(item => ({
        ...item,
        pickedQuantity: item.pickedQuantity || 0,
        packedQuantity: item.packedQuantity || 0
      }));
    }
    if (deliveryDate) delivery.deliveryDate = new Date(deliveryDate);
    if (expectedDeliveryDate !== undefined) delivery.expectedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : null;
    if (referenceNumber !== undefined) delivery.referenceNumber = referenceNumber;
    if (notes !== undefined) delivery.notes = notes;
    if (status && ['draft', 'waiting', 'picking', 'packing', 'ready', 'canceled'].includes(status)) {
      delivery.status = status;
    }

    await delivery.save();

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedDelivery,
    });
  } catch (error) {
    console.error("Update delivery error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Mark items as picked
// @route   POST /api/deliveries/:id/pick
// @access  Private (Admin, Manager, Warehouse)
export const pickDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // For warehouse staff, ensure they can only pick deliveries from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const deliveryWarehouseId = delivery.warehouseId._id || delivery.warehouseId;
      if (assignedWarehouseId.toString() !== deliveryWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only pick deliveries from your assigned warehouse",
        });
      }
    }

    if (delivery.status === 'done' || delivery.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: `Cannot pick items for delivery with status: ${delivery.status}`,
      });
    }

    const { items } = req.body; // Array of { itemId, pickedQuantity }

    if (items && items.length > 0) {
      for (const pickItem of items) {
        const deliveryItem = delivery.items.id(pickItem.itemId);
        if (deliveryItem) {
          deliveryItem.pickedQuantity = pickItem.pickedQuantity || deliveryItem.quantity;
        }
      }
    } else {
      // Mark all items as picked
      delivery.items.forEach(item => {
        item.pickedQuantity = item.quantity;
      });
    }

    // Update status
    if (delivery.status === 'draft' || delivery.status === 'waiting') {
      delivery.status = 'picking';
    }

    delivery.pickedBy = req.user._id;
    await delivery.save();

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('pickedBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedDelivery,
      message: "Items marked as picked",
    });
  } catch (error) {
    console.error("Pick delivery error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Mark items as packed
// @route   POST /api/deliveries/:id/pack
// @access  Private (Admin, Manager, Warehouse)
export const packDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // For warehouse staff, ensure they can only pack deliveries from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const deliveryWarehouseId = delivery.warehouseId._id || delivery.warehouseId;
      if (assignedWarehouseId.toString() !== deliveryWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only pack deliveries from your assigned warehouse",
        });
      }
    }

    if (delivery.status === 'done' || delivery.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: `Cannot pack items for delivery with status: ${delivery.status}`,
      });
    }

    const { items } = req.body; // Array of { itemId, packedQuantity }

    if (items && items.length > 0) {
      for (const packItem of items) {
        const deliveryItem = delivery.items.id(packItem.itemId);
        if (deliveryItem) {
          deliveryItem.packedQuantity = packItem.packedQuantity || deliveryItem.pickedQuantity || deliveryItem.quantity;
        }
      }
    } else {
      // Mark all items as packed
      delivery.items.forEach(item => {
        item.packedQuantity = item.pickedQuantity || item.quantity;
      });
    }

    // Update status
    if (delivery.status === 'picking') {
      delivery.status = 'packing';
    }
    // Check if all items are packed, then set to ready
    const allPacked = delivery.items.every(item => item.packedQuantity >= item.quantity);
    if (allPacked) {
      delivery.status = 'ready';
    }

    delivery.packedBy = req.user._id;
    await delivery.save();

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('packedBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedDelivery,
      message: "Items marked as packed",
    });
  } catch (error) {
    console.error("Pack delivery error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Validate delivery (updates stock)
// @route   POST /api/deliveries/:id/validate
// @access  Private (Admin, Manager)
export const validateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('warehouseId', 'name code locations');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // For warehouse staff, ensure they can only validate deliveries from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const deliveryWarehouseId = delivery.warehouseId._id || delivery.warehouseId;
      if (assignedWarehouseId.toString() !== deliveryWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only validate deliveries from your assigned warehouse",
        });
      }
    }

    if (delivery.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Delivery already validated",
      });
    }

    if (delivery.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: "Cannot validate canceled delivery",
      });
    }

    // Update stock for each item (subtract) and log movements
    for (const item of delivery.items) {
      // Get current stock BEFORE updating
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      const quantityBefore = product.stockByLocation.get(item.locationId) || 0;
      
      // Check if sufficient stock is available
      if (quantityBefore < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${quantityBefore}, Requested: ${item.quantity}`);
      }
      
      // Update stock (subtract)
      await updateProductStock(item.productId, item.locationId, item.quantity, 'subtract');
      
      // Get warehouse ID (handle both populated and non-populated cases)
      const warehouseId = delivery.warehouseId._id || delivery.warehouseId;
      
      // Calculate quantity after
      const quantityAfter = quantityBefore - item.quantity;
      
      // Log stock movement with explicit quantities
      await logStockMovement({
        movementType: 'delivery',
        documentId: delivery._id,
        documentNumber: delivery.deliveryNumber,
        productId: item.productId,
        warehouseId: warehouseId,
        locationId: item.locationId,
        quantity: item.quantity,
        quantityBefore: quantityBefore,
        quantityAfter: quantityAfter,
        reference: delivery.customer,
        notes: delivery.notes || "",
        performedBy: req.user._id
      });
    }

    // Update delivery status
    delivery.status = 'done';
    delivery.validatedBy = req.user._id;
    delivery.validatedAt = new Date();
    await delivery.save();

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku uom')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedDelivery,
      message: "Delivery validated and stock updated",
    });
  } catch (error) {
    console.error("Validate delivery error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Cancel delivery
// @route   DELETE /api/deliveries/:id
// @access  Private (Admin, Manager)
export const cancelDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // For warehouse staff, ensure they can only cancel deliveries from their assigned warehouse
    if (req.user.role === 'warehouse' && req.user.assignedWarehouse) {
      const assignedWarehouseId = req.user.assignedWarehouse._id || req.user.assignedWarehouse;
      const deliveryWarehouseId = delivery.warehouseId._id || delivery.warehouseId;
      if (assignedWarehouseId.toString() !== deliveryWarehouseId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only cancel deliveries from your assigned warehouse",
        });
      }
    }

    if (delivery.status === 'done') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel validated delivery",
      });
    }

    delivery.status = 'canceled';
    await delivery.save();

    res.status(200).json({
      success: true,
      message: "Delivery canceled",
    });
  } catch (error) {
    console.error("Cancel delivery error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

