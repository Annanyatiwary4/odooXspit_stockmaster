import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized to access this route" 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-in-production");
      req.user = await User.findById(decoded.id)
        .select("-password")
        .populate('assignedWarehouse', 'name code _id');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized, token failed" 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error in authentication" 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    // Flatten roles array in case nested arrays are passed
    const allowedRoles = roles.flat();
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }

    next();
  };
};

