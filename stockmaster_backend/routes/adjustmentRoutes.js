import express from "express";
import {
  getAdjustments,
  getAdjustment,
  createAdjustment,
  updateAdjustment,
  validateAdjustment,
  cancelAdjustment,
} from "../controllers/adjustmentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Public routes (for viewing)
router.get("/", getAdjustments);
router.get("/:id", getAdjustment);

// All roles can create adjustments
router.post("/", createAdjustment);

// Admin and Manager routes
router.put("/:id", authorize('admin', 'manager'), updateAdjustment);
router.post("/:id/validate", authorize('admin', 'manager'), validateAdjustment);
router.delete("/:id", authorize('admin', 'manager'), cancelAdjustment);

export default router;

