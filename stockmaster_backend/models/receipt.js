import mongoose from "mongoose";

const receiptItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0 },
    expectedQuantity: { type: Number, default: null },
    locationId: { type: String, required: true }, // Location ID within warehouse
    unitPrice: { type: Number, default: 0 },
    notes: { type: String, default: "" }
}, { _id: true });

const receiptSchema = new mongoose.Schema({
    receiptNumber: { type: String, unique: true, required: true },
    supplier: { type: String, required: true },
    supplierEmail: { type: String, default: "" },
    supplierPhone: { type: String, default: "" },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    items: [receiptItemSchema],
    status: { 
        type: String, 
        enum: ['draft', 'waiting', 'ready', 'done', 'canceled'], 
        default: 'draft' 
    },
    receiptDate: { type: Date, default: Date.now },
    expectedDate: { type: Date, default: null },
    referenceNumber: { type: String, default: "" },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    validatedAt: { type: Date, default: null }
}, { timestamps: true });

// Index for faster searches
receiptSchema.index({ receiptNumber: 1 });
receiptSchema.index({ status: 1 });
receiptSchema.index({ warehouseId: 1 });
receiptSchema.index({ supplier: 1 });
receiptSchema.index({ createdAt: -1 });

export default mongoose.model("Receipt", receiptSchema);

