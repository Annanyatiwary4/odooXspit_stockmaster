import Product from "../models/product.js";
import Receipt from "../models/receipt.js";
import Delivery from "../models/delivery.js";
import Transfer from "../models/transfer.js";
import Adjustment from "../models/adjustment.js";

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // Total Products
    const totalProducts = await Product.countDocuments();

    // Low Stock Products (below reorder level)
    const lowStock = await Product.find({
      $expr: { $lt: ["$totalStock", "$reorderLevel"] },
    }).select("name sku totalStock reorderLevel category");

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

    // Total inventory value (sum of all stock)
    const totalInventory = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$totalStock" },
        },
      },
    ]);

    // Product categories breakdown
    const categoryBreakdown = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$totalStock" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json({
      message: "Dashboard stats retrieved successfully",
      stats: {
        totalProducts,
        totalInventoryStock: totalInventory[0]?.totalStock || 0,
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
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Stock Movement History
export const getStockMovementHistory = async (req, res) => {
  try {
    const { productId, startDate, endDate, limit = 50 } = req.query;

    const query = {};
    
    if (productId) {
      query.productId = productId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get adjustments
    const adjustments = await Adjustment.find(query)
      .populate("productId", "name sku")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get validated receipts
    const receipts = await Receipt.find({ 
      status: "Validated",
      ...(startDate || endDate ? { createdAt: query.createdAt } : {})
    })
      .populate("items.productId", "name sku")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get validated deliveries
    const deliveries = await Delivery.find({ 
      status: "Validated",
      ...(startDate || endDate ? { createdAt: query.createdAt } : {})
    })
      .populate("items.productId", "name sku")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get validated transfers
    const transfers = await Transfer.find({ 
      status: "Validated",
      ...(startDate || endDate ? { createdAt: query.createdAt } : {})
    })
      .populate("items.productId", "name sku")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      message: "Stock movement history retrieved successfully",
      history: {
        adjustments,
        receipts,
        deliveries,
        transfers,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Warehouse Level Stock
export const getWarehouseLevelStock = async (req, res) => {
  try {
    const products = await Product.find().select("name sku stockByLocation totalStock");

    // Aggregate stock by warehouse/location
    const warehouseStock = {};

    products.forEach((product) => {
      const stockByLocation = Object.fromEntries(product.stockByLocation);
      
      Object.entries(stockByLocation).forEach(([location, stock]) => {
        if (!warehouseStock[location]) {
          warehouseStock[location] = {
            location,
            products: [],
            totalItems: 0,
          };
        }

        warehouseStock[location].products.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          stock,
        });

        warehouseStock[location].totalItems += stock;
      });
    });

    res.status(200).json({
      message: "Warehouse level stock retrieved successfully",
      warehouseStock: Object.values(warehouseStock),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
