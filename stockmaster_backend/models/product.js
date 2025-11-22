import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, unique: true, required: true, uppercase: true },
    category: { type: String, required: true },
    uom: { type: String, required: true }, // Unit of Measure: kg, pieces, boxes, liters, etc.
    description: { type: String, default: "" },
    totalStock: { type: Number, default: 0 },
    stockByLocation: {
        type: Map,
        of: Number,
        default: {}
    },
    reorderLevel: { type: Number, default: 5 },
    reorderQuantity: { type: Number, default: 10 },
    maxStock: { type: Number, default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Index for faster searches
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text' });

export default mongoose.model("Product", productSchema);
