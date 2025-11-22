import Product from "../models/product.js";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, sku, category, uom, reorderLevel } = req.body;

    const product = await Product.create({
      name,
      sku,
      category,
      uom,
      totalStock: 0,
      stockByLocation: {},
      reorderLevel: reorderLevel || 5,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      message: "Products retrieved successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Stock By Location
export const getStockByLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const stockByLocation = Object.fromEntries(product.stockByLocation);

    res.status(200).json({
      message: "Stock by location retrieved successfully",
      productId: product._id,
      productName: product.name,
      totalStock: product.totalStock,
      stockByLocation,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
