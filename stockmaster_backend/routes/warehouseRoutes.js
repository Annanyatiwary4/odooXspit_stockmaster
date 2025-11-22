import express from "express";
import {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  addLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/warehouseController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Public warehouse routes (for viewing)
router.get("/", getWarehouses);
router.get("/:id", getWarehouse);

// Admin only routes
router.post("/", authorize('admin'), createWarehouse);
router.put("/:id", authorize('admin'), updateWarehouse);
router.delete("/:id", authorize('admin'), deleteWarehouse);
router.post("/:id/locations", authorize('admin'), addLocation);
router.put("/:id/locations/:locationId", authorize('admin'), updateLocation);
router.delete("/:id/locations/:locationId", authorize('admin'), deleteLocation);

export default router;

