import express from "express";
import {
  createTransfer,
  validateTransfer,
} from "../controllers/transferController.js";

const router = express.Router();

// POST /api/transfers - Create transfer
router.post("/", createTransfer);

// POST /api/transfers/:id/validate - Validate transfer
router.post("/:id/validate", validateTransfer);

export default router;
