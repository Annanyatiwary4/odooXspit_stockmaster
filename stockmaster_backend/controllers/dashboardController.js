import Product from "../models/product.js";
import Receipt from "../models/receipt.js";
import Delivery from "../models/delivery.js";
import Transfer from "../models/transfer.js";

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // Total Products
    const totalProducts = await Product.countDocuments();

    // Low Stock Products (below reorder level)
    const lowStock = await Product.find({
      $expr: { $lt: ["$totalStock", "$reorderLevel"] },
    }).select("name sku totalStock reorderLevel");

    // Pending Receipts
    const pendingReceipts = await Receipt.find({ status: "Draft" })
      .populate("items.productId", "name sku")
      .select("supplier location items createdAt");

    // Pending Deliveries
    const pendingDeliveries = await Delivery.find({ status: "Draft" })
      .populate("items.productId", "name sku")
      .select("customer items createdAt");

    // Pending Transfers
    const pendingTransfers = await Transfer.find({ status: "Draft" })
      .populate("items.productId", "name sku")
      .select("from to items createdAt");

    res.status(200).json({
      message: "Dashboard stats retrieved successfully",
      stats: {
        totalProducts,
        lowStock: {
          count: lowStock.length,
          products: lowStock,
        },
        pendingReceipts: {
          count: pendingReceipts.length,
          receipts: pendingReceipts,
        },
        pendingDeliveries: {
          count: pendingDeliveries.length,
          deliveries: pendingDeliveries,
        },
        pendingTransfers: {
          count: pendingTransfers.length,
          transfers: pendingTransfers,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
