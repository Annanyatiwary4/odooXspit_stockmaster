import Warehouse from "../models/warehouse.js";

// Admin: Create Warehouse
export const createWarehouse = async (req, res) => {
  try {
    const { name, code, address } = req.body;

    // Check if warehouse code already exists
    const existingWarehouse = await Warehouse.findOne({ code });
    if (existingWarehouse) {
      return res.status(400).json({ message: "Warehouse code already exists" });
    }

    const warehouse = await Warehouse.create({
      name,
      code,
      address,
    });

    res.status(201).json({
      message: "Warehouse created successfully",
      warehouse,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Warehouses
export const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();

    res.status(200).json({
      message: "Warehouses retrieved successfully",
      count: warehouses.length,
      warehouses,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single Warehouse
export const getWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    res.status(200).json({
      message: "Warehouse retrieved successfully",
      warehouse,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Update Warehouse
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const warehouse = await Warehouse.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    res.status(200).json({
      message: "Warehouse updated successfully",
      warehouse,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Delete Warehouse
export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await Warehouse.findByIdAndDelete(id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    res.status(200).json({
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
