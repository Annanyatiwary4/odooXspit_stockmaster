import express from "express";
import {
  createReceipt,
  validateReceipt,
} from "../controllers/receiptController.js";

const router = express.Router();

// POST /api/receipts - Create receipt
router.post("/", createReceipt);

// POST /api/receipts/:id/validate - Validate receipt
router.post("/:id/validate", validateReceipt);

export default router;
