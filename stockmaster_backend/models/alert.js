import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ["Low Stock", "Out of Stock", "Reorder Suggestion", "Critical Stock"],
        required: true 
    },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    message: String,
    severity: { 
        type: String, 
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Medium" 
    },
    status: { 
        type: String, 
        enum: ["Active", "Acknowledged", "Resolved"],
        default: "Active" 
    },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acknowledgedAt: Date,
    resolvedAt: Date,
    currentStock: Number,
    reorderLevel: Number
}, { timestamps: true });

export default mongoose.model("Alert", alertSchema);
