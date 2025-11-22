import express from "express";
import {
  generateAlerts,
  getAllAlerts,
  acknowledgeAlert,
  resolveAlert,
  getAlertSummary,
} from "../controllers/alertController.js";
import { authenticate, isAdminOrManager, isAdminOrStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// All alert routes require authentication
router.use(authenticate);

// GET routes - all authenticated users can view alerts
router.get("/", isAdminOrStaff, getAllAlerts);
router.get("/summary", isAdminOrStaff, getAlertSummary);

// POST routes - Manager/Admin can manage alerts
router.post("/generate", isAdminOrManager, generateAlerts);
router.post("/:id/acknowledge", isAdminOrManager, acknowledgeAlert);
router.post("/:id/resolve", isAdminOrManager, resolveAlert);

export default router;
