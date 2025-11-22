import express from "express";
import {
  getTransfers,
  getTransfer,
  createTransfer,
  updateTransfer,
  executeTransfer,
  cancelTransfer,
} from "../controllers/transferController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Public routes (for viewing)
router.get("/", getTransfers);
router.get("/:id", getTransfer);

// Admin and Manager routes
router.post("/", authorize('admin', 'manager'), createTransfer);
router.put("/:id", authorize('admin', 'manager'), updateTransfer);
router.delete("/:id", authorize('admin', 'manager'), cancelTransfer);

// Execute transfer (all roles can do this)
router.post("/:id/execute", authorize('admin', 'manager', 'warehouse'), executeTransfer);

export default router;

