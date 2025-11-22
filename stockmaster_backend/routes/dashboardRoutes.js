import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/dashboard - Get dashboard stats
router.get("/", getDashboardStats);

export default router;
