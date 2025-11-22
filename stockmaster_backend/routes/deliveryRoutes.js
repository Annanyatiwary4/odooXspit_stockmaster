import express from "express";
import {
  createDelivery,
  validateDelivery,
} from "../controllers/deliveryController.js";
import { authenticate, isAdminOrStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// All delivery routes require authentication (admin or staff)
router.use(authenticate);
router.use(isAdminOrStaff);

// POST /api/delivery - Create delivery
router.post("/", createDelivery);

// POST /api/delivery/:id/validate - Validate delivery
router.post("/:id/validate", validateDelivery);

export default router;
