import Alert from "../models/alert.js";
import Product from "../models/product.js";

// Generate Alerts (Auto-check for low stock)
export const generateAlerts = async (req, res) => {
  try {
    // Find products below reorder level
    const lowStockProducts = await Product.find({
      $expr: { $lt: ["$totalStock", "$reorderLevel"] },
    });

    const alerts = [];

    for (const product of lowStockProducts) {
      // Check if alert already exists for this product
      const existingAlert = await Alert.findOne({
        productId: product._id,
        status: "Active",
        type: { $in: ["Low Stock", "Out of Stock", "Critical Stock"] }
      });

      if (!existingAlert) {
        let alertType = "Low Stock";
        let severity = "Medium";
        let message = `${product.name} (SKU: ${product.sku}) is running low. Current stock: ${product.totalStock}, Reorder level: ${product.reorderLevel}`;

        if (product.totalStock === 0) {
          alertType = "Out of Stock";
          severity = "Critical";
          message = `${product.name} (SKU: ${product.sku}) is out of stock!`;
        } else if (product.totalStock < product.reorderLevel / 2) {
          alertType = "Critical Stock";
          severity = "High";
          message = `${product.name} (SKU: ${product.sku}) is critically low. Current stock: ${product.totalStock}, Reorder level: ${product.reorderLevel}`;
        }

        const alert = await Alert.create({
          type: alertType,
          productId: product._id,
          message,
          severity,
          currentStock: product.totalStock,
          reorderLevel: product.reorderLevel,
        });

        alerts.push(alert);
      }
    }

    res.status(200).json({
      message: `Generated ${alerts.length} new alerts`,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Alerts (Manager and Admin)
export const getAllAlerts = async (req, res) => {
  try {
    const { status, severity } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const alerts = await Alert.find(query)
      .populate("productId", "name sku category totalStock reorderLevel")
      .populate("acknowledgedBy", "name")
      .sort({ severity: -1, createdAt: -1 });

    res.status(200).json({
      message: "Alerts retrieved successfully",
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Acknowledge Alert (Manager or Admin)
export const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByIdAndUpdate(
      id,
      {
        status: "Acknowledged",
        acknowledgedBy: req.user._id,
        acknowledgedAt: new Date(),
      },
      { new: true }
    ).populate("productId", "name sku");

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.status(200).json({
      message: "Alert acknowledged successfully",
      alert,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resolve Alert (Manager or Admin)
export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByIdAndUpdate(
      id,
      {
        status: "Resolved",
        resolvedAt: new Date(),
      },
      { new: true }
    ).populate("productId", "name sku");

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.status(200).json({
      message: "Alert resolved successfully",
      alert,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Alert Summary
export const getAlertSummary = async (req, res) => {
  try {
    const activeAlerts = await Alert.countDocuments({ status: "Active" });
    const criticalAlerts = await Alert.countDocuments({ 
      status: "Active", 
      severity: "Critical" 
    });
    const highAlerts = await Alert.countDocuments({ 
      status: "Active", 
      severity: "High" 
    });

    const recentAlerts = await Alert.find({ status: "Active" })
      .populate("productId", "name sku")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      message: "Alert summary retrieved successfully",
      summary: {
        activeAlerts,
        criticalAlerts,
        highAlerts,
        recentAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
