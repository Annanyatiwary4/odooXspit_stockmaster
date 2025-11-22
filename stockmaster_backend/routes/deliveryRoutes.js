import express from "express";
import {
  createDelivery,
  assignPicker,
  completePicking,
  assignPacker,
  completePacking,
  validateDelivery,
  getAllDeliveries,
  getMyTasks,
} from "../controllers/deliveryController.js";
import { authenticate, isAdminOrManager, isAdminOrStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET routes - all authenticated users
router.get("/", authenticate, isAdminOrStaff, getAllDeliveries);
router.get("/my-tasks", authenticate, getMyTasks); // Staff can view their tasks

// POST routes - Manager/Admin for creation and assignment
router.post("/", authenticate, isAdminOrManager, createDelivery);
router.post("/:id/assign-picker", authenticate, isAdminOrManager, assignPicker);
router.post("/:id/assign-packer", authenticate, isAdminOrManager, assignPacker);
router.post("/:id/validate", authenticate, isAdminOrManager, validateDelivery);

// POST routes - Staff can complete their assigned tasks
router.post("/:id/complete-picking", authenticate, completePicking);
router.post("/:id/complete-packing", authenticate, completePacking);

export default router;
