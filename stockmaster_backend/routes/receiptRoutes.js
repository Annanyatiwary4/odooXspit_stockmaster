import express from "express";
import {
  createReceipt,
  validateReceipt,
} from "../controllers/receiptController.js";
import { authenticate, isAdminOrManager } from "../middleware/authMiddleware.js";

const router = express.Router();

// All receipt routes require authentication (admin or manager)
router.use(authenticate);
router.use(isAdminOrManager);

// POST /api/receipts - Create receipt
router.post("/", createReceipt);

// POST /api/receipts/:id/validate - Validate receipt
router.post("/:id/validate", validateReceipt);

export default router;
