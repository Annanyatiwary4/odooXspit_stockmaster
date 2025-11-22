import express from "express";
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getStockByLocation,
} from "../controllers/productController.js";

const router = express.Router();

// POST /api/products - Create product
router.post("/", createProduct);

// PUT /api/products/:id - Update product
router.put("/:id", updateProduct);

// GET /api/products - Get all products
router.get("/", getAllProducts);

// GET /api/products/:id/stock - Get stock by location
router.get("/:id/stock", getStockByLocation);

export default router;
