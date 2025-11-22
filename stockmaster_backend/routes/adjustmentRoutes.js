import express from "express";
import { adjustStock } from "../controllers/adjustmentController.js";
import { authenticate, isAdminOrManager } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/adjustments - requires authentication (admin or manager)
router.post("/", authenticate, isAdminOrManager, adjustStock);

export default router;
