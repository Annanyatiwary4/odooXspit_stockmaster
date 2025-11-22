import express from "express";
import {
  getReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  validateReceipt,
  cancelReceipt,
} from "../controllers/receiptController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Public routes (for viewing)
router.get("/", getReceipts);
router.get("/:id", getReceipt);

// Admin and Manager routes
router.post("/", authorize('admin', 'manager'), createReceipt);
router.put("/:id", authorize('admin', 'manager'), updateReceipt);
router.post("/:id/validate", authorize('admin', 'manager'), validateReceipt);
router.delete("/:id", authorize('admin', 'manager'), cancelReceipt);

export default router;

