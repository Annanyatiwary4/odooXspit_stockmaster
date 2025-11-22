import express from "express";
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getStockByLocation,
} from "../controllers/productController.js";
import { authenticate, isAdmin, isAdminOrStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET routes - accessible by admin and staff
router.get("/", authenticate, isAdminOrStaff, getAllProducts);
router.get("/:id/stock", authenticate, isAdminOrStaff, getStockByLocation);

// POST, PUT routes - admin only
router.post("/", authenticate, isAdmin, createProduct);
router.put("/:id", authenticate, isAdmin, updateProduct);

export default router;
