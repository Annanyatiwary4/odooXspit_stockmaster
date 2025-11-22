import express from "express";
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../controllers/warehouseController.js";
import { authenticate, isAdmin, isAdminOrStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET routes - accessible by admin and staff
router.get("/", authenticate, isAdminOrStaff, getAllWarehouses);
router.get("/:id", authenticate, isAdminOrStaff, getWarehouse);

// POST, PUT, DELETE routes - admin only
router.post("/", authenticate, isAdmin, createWarehouse);
router.put("/:id", authenticate, isAdmin, updateWarehouse);
router.delete("/:id", authenticate, isAdmin, deleteWarehouse);

export default router;
