import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: String,
    sku: String,
    category: String,
    uom: String,
    totalStock: { type: Number, default: 0 },

    stockByLocation: {
        type: Map,
        of: Number,     
        default: {}
    },

    reorderLevel: { type: Number, default: 5 }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
