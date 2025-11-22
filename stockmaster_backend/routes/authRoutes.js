import express from "express";
import {
  signup,
  login,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", protect, getMe);

export default router;

