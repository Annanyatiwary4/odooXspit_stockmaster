import express from "express";
import { adjustStock } from "../controllers/adjustmentController.js";

const router = express.Router();

// POST /api/adjustments 
router.post("/", adjustStock);

export default router;
