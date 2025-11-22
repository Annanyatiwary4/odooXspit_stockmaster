import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import adjustmentRoutes from "./routes/adjustmentRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect DB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "StockMaster API is running...",
    version: "1.0.0"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/adjustments", adjustmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
