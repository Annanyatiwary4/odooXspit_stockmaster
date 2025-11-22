import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Verify JWT token and attach user to request
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      message: "Access denied. Admin privileges required." 
    });
  }
  next();
};

// Check if user is admin or staff
export const isAdminOrStaff = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "staff") {
    return res.status(403).json({ 
      message: "Access denied. Admin or staff privileges required." 
    });
  }
  next();
};
