import Warehouse from "../models/warehouse.js";

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
export const getWarehouses = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const warehouses = await Warehouse.find(query)
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: warehouses,
    });
  } catch (error) {
    console.error("Get warehouses error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get warehouse by ID
// @route   GET /api/warehouses/:id
// @access  Private
export const getWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate('manager', 'name email');
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    console.error("Get warehouse error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Create warehouse
// @route   POST /api/warehouses
// @access  Private (Admin only)
export const createWarehouse = async (req, res) => {
  try {
    const { name, code, address, contactPhone, contactEmail, manager } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and code",
      });
    }

    // Check if code already exists
    const existingWarehouse = await Warehouse.findOne({ code: code.toUpperCase() });
    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: "Warehouse with this code already exists",
      });
    }

    const warehouse = await Warehouse.create({
      name,
      code: code.toUpperCase(),
      address: address || "",
      contactPhone: contactPhone || "",
      contactEmail: contactEmail || "",
      manager: manager || null,
    });

    const populatedWarehouse = await Warehouse.findById(warehouse._id)
      .populate('manager', 'name email');

    res.status(201).json({
      success: true,
      data: populatedWarehouse,
    });
  } catch (error) {
    console.error("Create warehouse error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private (Admin only)
export const updateWarehouse = async (req, res) => {
  try {
    const { name, code, address, contactPhone, contactEmail, manager, status } = req.body;

    const warehouse = await Warehouse.findById(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // Check if code is being changed and if it already exists
    if (code && code.toUpperCase() !== warehouse.code) {
      const existingWarehouse = await Warehouse.findOne({ code: code.toUpperCase() });
      if (existingWarehouse) {
        return res.status(400).json({
          success: false,
          message: "Warehouse with this code already exists",
        });
      }
    }

    // Update fields
    if (name) warehouse.name = name;
    if (code) warehouse.code = code.toUpperCase();
    if (address !== undefined) warehouse.address = address;
    if (contactPhone !== undefined) warehouse.contactPhone = contactPhone;
    if (contactEmail !== undefined) warehouse.contactEmail = contactEmail;
    if (manager !== undefined) warehouse.manager = manager;
    if (status) warehouse.status = status;

    await warehouse.save();

    const populatedWarehouse = await Warehouse.findById(warehouse._id)
      .populate('manager', 'name email');

    res.status(200).json({
      success: true,
      data: populatedWarehouse,
    });
  } catch (error) {
    console.error("Update warehouse error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private (Admin only)
export const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    await Warehouse.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("Delete warehouse error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Add location to warehouse
// @route   POST /api/warehouses/:id/locations
// @access  Private (Admin only)
export const addLocation = async (req, res) => {
  try {
    const { name, code, type, capacity, parentLocation } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and code",
      });
    }

    const warehouse = await Warehouse.findById(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // Check if location code already exists in this warehouse
    const existingLocation = warehouse.locations.find(loc => loc.code === code.toUpperCase());
    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: "Location with this code already exists in this warehouse",
      });
    }

    warehouse.locations.push({
      name,
      code: code.toUpperCase(),
      type: type || 'area',
      capacity: capacity || null,
      parentLocation: parentLocation || null
    });

    await warehouse.save();

    res.status(201).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    console.error("Add location error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update location in warehouse
// @route   PUT /api/warehouses/:id/locations/:locationId
// @access  Private (Admin only)
export const updateLocation = async (req, res) => {
  try {
    const { name, code, type, capacity, parentLocation } = req.body;

    const warehouse = await Warehouse.findById(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    const location = warehouse.locations.id(req.params.locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    // Check if code is being changed and if it already exists
    if (code && code.toUpperCase() !== location.code) {
      const existingLocation = warehouse.locations.find(
        loc => loc.code === code.toUpperCase() && loc._id.toString() !== req.params.locationId
      );
      if (existingLocation) {
        return res.status(400).json({
          success: false,
          message: "Location with this code already exists in this warehouse",
        });
      }
    }

    if (name) location.name = name;
    if (code) location.code = code.toUpperCase();
    if (type) location.type = type;
    if (capacity !== undefined) location.capacity = capacity;
    if (parentLocation !== undefined) location.parentLocation = parentLocation;

    await warehouse.save();

    res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Delete location from warehouse
// @route   DELETE /api/warehouses/:id/locations/:locationId
// @access  Private (Admin only)
export const deleteLocation = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    const location = warehouse.locations.id(req.params.locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    warehouse.locations.pull(req.params.locationId);
    await warehouse.save();

    res.status(200).json({
      success: true,
      message: "Location deleted successfully",
      data: warehouse,
    });
  } catch (error) {
    console.error("Delete location error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

