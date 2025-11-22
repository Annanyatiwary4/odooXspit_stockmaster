import express from "express";
import { signup, login, sendOTP, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/send-otp
router.post("/send-otp", sendOTP);

// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

export default router;
