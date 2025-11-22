import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getCategories,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Public product routes (for viewing)
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProduct);

// Admin and Manager routes
router.post("/", authorize('admin', 'manager'), createProduct);
router.put("/:id", authorize('admin', 'manager'), updateProduct);
router.put("/:id/stock", authorize('admin', 'manager'), updateStock);

// Admin only routes
router.delete("/:id", authorize('admin'), deleteProduct);

export default router;

