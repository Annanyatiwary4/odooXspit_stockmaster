import Delivery from "../models/delivery.js";
import Product from "../models/product.js";

// Create Delivery
export const createDelivery = async (req, res) => {
  try {
    const { customer, items } = req.body;

    const delivery = await Delivery.create({
      customer,
      status: "Draft",
      items,
    });

    res.status(201).json({
      message: "Delivery created successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate Delivery (Decrease Stock)
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
    await delivery.save();

    res.status(200).json({
      message: "Delivery validated successfully",
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
