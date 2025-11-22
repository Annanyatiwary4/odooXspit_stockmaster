import express from "express";
import {
  createUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticate, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All user management routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// POST /api/users - Create user (admin only)
router.post("/", createUser);

// GET /api/users - Get all users (admin only)
router.get("/", getAllUsers);

// PUT /api/users/:id - Update user (admin only)
router.put("/:id", updateUser);

// PATCH /api/users/:id/deactivate - Deactivate user (admin only)
router.patch("/:id/deactivate", deactivateUser);

// PATCH /api/users/:id/activate - Activate user (admin only)
router.patch("/:id/activate", activateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete("/:id", deleteUser);

export default router;
