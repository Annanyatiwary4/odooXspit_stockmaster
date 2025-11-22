import express from "express";
import {
  createTransfer,
  validateTransfer,
} from "../controllers/transferController.js";
import { authenticate, isAdminOrManager } from "../middleware/authMiddleware.js";

const router = express.Router();

// All transfer routes require authentication (admin or manager)
router.use(authenticate);
router.use(isAdminOrManager);

// POST /api/transfers - Create transfer
router.post("/", createTransfer);

// POST /api/transfers/:id/validate - Validate transfer
router.post("/:id/validate", validateTransfer);

export default router;
