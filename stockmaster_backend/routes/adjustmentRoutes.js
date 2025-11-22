import express from "express";
import { adjustStock } from "../controllers/adjustmentController.js";
import { authenticate, isAdminOrStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/adjustments - requires authentication (admin or staff)
router.post("/", authenticate, isAdminOrStaff, adjustStock);

export default router;
