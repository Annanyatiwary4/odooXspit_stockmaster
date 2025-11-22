import Delivery from "../models/delivery.js";
import Product from "../models/product.js";

// Create Delivery (Manager or Admin)
export const createDelivery = async (req, res) => {
  try {
    const { customer, items, notes } = req.body;

    // Generate delivery number
    const count = await Delivery.countDocuments();
    const deliveryNumber = `DEL-${String(count + 1).padStart(5, '0')}`;

    const delivery = await Delivery.create({
      customer,
      status: "Draft",
      deliveryNumber,
      notes,
      items: items.map(item => ({
        ...item,
        pickedQty: 0,
        packedQty: 0
      })),
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Delivery created successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign Picker (Manager or Admin)
export const assignPicker = async (req, res) => {
  try {
    const { id } = req.params;
    const { pickerId } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { 
        assignedPicker: pickerId,
        status: "Picking",
        pickingStatus: "In Progress"
      },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({
      message: "Picker assigned successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Complete Picking (Staff)
export const completePicking = async (req, res) => {
  try {
    const { id } = req.params;
    const { pickedItems } = req.body; // [{ productId, pickedQty }]

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Update picked quantities
    pickedItems.forEach(picked => {
      const item = delivery.items.find(i => i.productId.toString() === picked.productId);
      if (item) {
        item.pickedQty = picked.pickedQty;
      }
    });

    delivery.pickingStatus = "Completed";
    delivery.pickingCompletedAt = new Date();
    delivery.status = "Packing";
    
    await delivery.save();

    res.status(200).json({
      message: "Picking completed successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign Packer (Manager or Admin)
export const assignPacker = async (req, res) => {
  try {
    const { id } = req.params;
    const { packerId } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { 
        assignedPacker: packerId,
        packingStatus: "In Progress"
      },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({
      message: "Packer assigned successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Complete Packing (Staff)
export const completePacking = async (req, res) => {
  try {
    const { id } = req.params;
    const { packedItems } = req.body; // [{ productId, packedQty }]

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Update packed quantities
    packedItems.forEach(packed => {
      const item = delivery.items.find(i => i.productId.toString() === packed.productId);
      if (item) {
        item.packedQty = packed.packedQty;
      }
    });

    delivery.packingStatus = "Completed";
    delivery.packingCompletedAt = new Date();
    delivery.status = "Ready";
    
    await delivery.save();

    res.status(200).json({
      message: "Packing completed successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate Delivery (Decrease Stock) - Manager or Admin
export const validateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body; // Location from which stock is delivered

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (delivery.status === "Validated") {
      return res.status(400).json({ message: "Delivery already validated" });
    }

    // Update stock for each item
    for (const item of delivery.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found` });
      }

      // Check if sufficient stock is available
      if (product.totalStock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}`,
        });
      }

      // Decrease total stock
      product.totalStock -= item.qty;

      // Update stock by location
      const deliveryLocation = location || "default";
      const currentLocationStock =
        product.stockByLocation.get(deliveryLocation) || 0;

      if (currentLocationStock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock at location ${deliveryLocation} for product ${product.name}`,
        });
      }

      product.stockByLocation.set(
        deliveryLocation,
        currentLocationStock - item.qty
      );

      await product.save();
    }

    // Update delivery status
    delivery.status = "Validated";
    delivery.validatedBy = req.user._id;
    delivery.validatedAt = new Date();
    await delivery.save();

    res.status(200).json({
      message: "Delivery validated successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Deliveries
export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate("items.productId", "name sku")
      .populate("createdBy", "name email")
      .populate("assignedPicker", "name")
      .populate("assignedPacker", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Deliveries retrieved successfully",
      count: deliveries.length,
      deliveries,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get My Assigned Tasks (Staff)
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const pickingTasks = await Delivery.find({
      assignedPicker: userId,
      pickingStatus: { $ne: "Completed" }
    }).populate("items.productId", "name sku");

    const packingTasks = await Delivery.find({
      assignedPacker: userId,
      packingStatus: { $ne: "Completed" }
    }).populate("items.productId", "name sku");

    res.status(200).json({
      message: "Tasks retrieved successfully",
      pickingTasks,
      packingTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
