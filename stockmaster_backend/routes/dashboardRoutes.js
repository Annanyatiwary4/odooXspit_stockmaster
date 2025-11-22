import express from "express";
import { 
  getDashboardStats, 
  getStockMovementHistory, 
  getWarehouseLevelStock 
} from "../controllers/dashboardController.js";
import { authenticate, isAdminOrStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// All dashboard routes require authentication (admin or staff)
router.use(authenticate);
router.use(isAdminOrStaff);

// GET /api/dashboard - Get dashboard stats
router.get("/", getDashboardStats);

// GET /api/dashboard/stock-movement - Get stock movement history
router.get("/stock-movement", getStockMovementHistory);

// GET /api/dashboard/warehouse-stock - Get warehouse level stock
router.get("/warehouse-stock", getWarehouseLevelStock);

export default router;
