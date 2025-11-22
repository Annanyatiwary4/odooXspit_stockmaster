import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deactivateUser,
  getDashboardStats,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

// User management
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.put("/users/:id/deactivate", deactivateUser);

// Dashboard
router.get("/dashboard", getDashboardStats);

export default router;

