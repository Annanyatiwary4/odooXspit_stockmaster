import mongoose from "mongoose";

const transferItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" }
}, { _id: true });

const transferSchema = new mongoose.Schema({
    transferNumber: { type: String, unique: true, required: true },
    sourceWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    sourceLocationId: { type: String, required: true },
    destinationWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    destinationLocationId: { type: String, required: true },
    items: [transferItemSchema],
    status: { 
        type: String, 
        enum: ['draft', 'waiting', 'ready', 'done', 'canceled'], 
        default: 'draft' 
    },
    transferDate: { type: Date, default: Date.now },
    scheduledDate: { type: Date, default: null },
    reason: { type: String, default: "" },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    executedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    executedAt: { type: Date, default: null }
}, { timestamps: true });

// Index for faster searches
transferSchema.index({ transferNumber: 1 });
transferSchema.index({ status: 1 });
transferSchema.index({ sourceWarehouseId: 1 });
transferSchema.index({ destinationWarehouseId: 1 });
transferSchema.index({ createdAt: -1 });

export default mongoose.model("Transfer", transferSchema);
