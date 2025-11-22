import express from "express";
import {
  createDelivery,
  validateDelivery,
} from "../controllers/deliveryController.js";

const router = express.Router();

// POST /api/delivery - Create delivery
router.post("/", createDelivery);

// POST /api/delivery/:id/validate - Validate delivery
router.post("/:id/validate", validateDelivery);

export default router;
