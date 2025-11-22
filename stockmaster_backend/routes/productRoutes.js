import express from "express";
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getStockByLocation,
} from "../controllers/productController.js";
import { authenticate, isAdmin, isAdminOrManager, isAdminOrStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET routes - accessible by all authenticated users
router.get("/", authenticate, isAdminOrStaff, getAllProducts);
router.get("/:id/stock", authenticate, isAdminOrStaff, getStockByLocation);

// POST, PUT routes - admin and manager only
router.post("/", authenticate, isAdminOrManager, createProduct);
router.put("/:id", authenticate, isAdminOrManager, updateProduct);

export default router;
