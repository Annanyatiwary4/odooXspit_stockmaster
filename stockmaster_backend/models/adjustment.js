import mongoose from "mongoose";

const adjustmentSchema = new mongoose.Schema({
    adjustmentNumber: { type: String, unique: true, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    locationId: { type: String, required: true },
    systemQuantity: { type: Number, required: true }, // Recorded stock in system
    countedQuantity: { type: Number, required: true }, // Physical counted quantity
    difference: { type: Number, required: true }, // countedQuantity - systemQuantity
    adjustmentType: { 
        type: String, 
        enum: ['damaged', 'lost', 'found', 'correction', 'other'], 
        default: 'correction' 
    },
    reason: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['draft', 'done', 'canceled'], 
        default: 'draft' 
    },
    adjustmentDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    validatedAt: { type: Date, default: null }
}, { timestamps: true });

// Index for faster searches
adjustmentSchema.index({ adjustmentNumber: 1 });
adjustmentSchema.index({ status: 1 });
adjustmentSchema.index({ productId: 1 });
adjustmentSchema.index({ warehouseId: 1 });
adjustmentSchema.index({ createdAt: -1 });

export default mongoose.model("Adjustment", adjustmentSchema);
