import Transfer from "../models/transfer.js";
import Product from "../models/product.js";

// Create Transfer
export const createTransfer = async (req, res) => {
  try {
    const { from, to, items } = req.body;

    const transfer = await Transfer.create({
      from,
      to,
      status: "Draft",
      items,
    });

    res.status(201).json({
      message: "Transfer created successfully",
      transfer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate Transfer (Update stockByLocation)
export const validateTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await Transfer.findById(id);

    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    if (transfer.status === "Validated") {
      return res.status(400).json({ message: "Transfer already validated" });
    }

    const fromLocation = transfer.from;
    const toLocation = transfer.to;

    // Update stock by location for each item
    for (const item of transfer.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found` });
      }

      // Check if sufficient stock at source location
      const currentFromStock = product.stockByLocation.get(fromLocation) || 0;

      if (currentFromStock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock at location ${fromLocation} for product ${product.name}`,
        });
      }

      // Decrease stock at source location
      product.stockByLocation.set(fromLocation, currentFromStock - item.qty);

      // Increase stock at destination location
      const currentToStock = product.stockByLocation.get(toLocation) || 0;
      product.stockByLocation.set(toLocation, currentToStock + item.qty);

      // Total stock remains the same during transfer
      await product.save();
    }

    // Update transfer status
    transfer.status = "Validated";
    await transfer.save();

    res.status(200).json({
      message: "Transfer validated successfully",
      transfer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
