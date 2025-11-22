import Receipt from "../models/receipt.js";
import Product from "../models/product.js";

// Create Receipt
export const createReceipt = async (req, res) => {
  try {
    const { supplier, location, items } = req.body;

    const receipt = await Receipt.create({
      supplier,
      location,
      status: "Draft",
      items,
    });

    res.status(201).json({
      message: "Receipt created successfully",
      receipt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate Receipt (Increase Stock)
export const validateReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id);

    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    if (receipt.status === "Validated") {
      return res.status(400).json({ message: "Receipt already validated" });
    }

    // Update stock for each item
    for (const item of receipt.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found` });
      }

      // Increase total stock
      product.totalStock += item.qty;

      // Update stock by location
      const location = receipt.location || "default";
      const currentLocationStock = product.stockByLocation.get(location) || 0;
      product.stockByLocation.set(location, currentLocationStock + item.qty);

      await product.save();
    }

    // Update receipt status
    receipt.status = "Validated";
    await receipt.save();

    res.status(200).json({
      message: "Receipt validated successfully",
      receipt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
