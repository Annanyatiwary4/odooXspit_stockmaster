import Adjustment from "../models/adjustment.js";
import Product from "../models/product.js";

// Adjust Stock
export const adjustStock = async (req, res) => {
  try {
    const { productId, location, systemQty, countedQty, reason } = req.body;

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create adjustment record
    const adjustment = await Adjustment.create({
      productId,
      location,
      systemQty,
      countedQty,
      reason,
    });

    // Calculate difference
    const difference = countedQty - systemQty;

    // Update total stock
    product.totalStock += difference;

    // Update stock by location
    const currentLocationStock = product.stockByLocation.get(location) || 0;
    product.stockByLocation.set(location, currentLocationStock + difference);

    await product.save();

    res.status(200).json({
      message: "Stock adjusted successfully",
      adjustment,
      difference,
      updatedProduct: {
        id: product._id,
        name: product.name,
        totalStock: product.totalStock,
        stockByLocation: Object.fromEntries(product.stockByLocation),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
