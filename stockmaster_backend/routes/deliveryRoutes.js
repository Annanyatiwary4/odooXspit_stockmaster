import express from "express";
import {
  getDeliveries,
  getDelivery,
  createDelivery,
  updateDelivery,
  pickDelivery,
  packDelivery,
  validateDelivery,
  cancelDelivery,
} from "../controllers/deliveryController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Public routes (for viewing)
router.get("/", getDeliveries);
router.get("/:id", getDelivery);

// Admin and Manager routes
router.post("/", authorize('admin', 'manager'), createDelivery);
router.put("/:id", authorize('admin', 'manager'), updateDelivery);
router.post("/:id/validate", authorize('admin', 'manager'), validateDelivery);
router.delete("/:id", authorize('admin', 'manager'), cancelDelivery);

// Picking and Packing (all roles can do this)
router.post("/:id/pick", authorize('admin', 'manager', 'warehouse'), pickDelivery);
router.post("/:id/pack", authorize('admin', 'manager', 'warehouse'), packDelivery);

export default router;

