import mongoose from "mongoose";

const stockLedgerSchema = new mongoose.Schema({
    movementType: { 
        type: String, 
        enum: ['receipt', 'delivery', 'transfer', 'adjustment'], 
        required: true 
    },
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of receipt/delivery/transfer/adjustment
    documentNumber: { type: String, required: true }, // Receipt number, delivery number, etc.
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    locationId: { type: String, required: true },
    quantity: { type: Number, required: true }, // Positive for receipt/adjustment increase, negative for delivery
    quantityBefore: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    // For transfers, we need source and destination
    sourceWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", default: null },
    sourceLocationId: { type: String, default: null },
    destinationWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", default: null },
    destinationLocationId: { type: String, default: null },
    // Additional details
    reference: { type: String, default: "" }, // Supplier, customer, reason, etc.
    notes: { type: String, default: "" },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movementDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster searches
stockLedgerSchema.index({ movementType: 1 });
stockLedgerSchema.index({ productId: 1 });
stockLedgerSchema.index({ warehouseId: 1 });
stockLedgerSchema.index({ locationId: 1 });
stockLedgerSchema.index({ movementDate: -1 });
stockLedgerSchema.index({ documentId: 1 });
stockLedgerSchema.index({ documentNumber: 1 });

export default mongoose.model("StockLedger", stockLedgerSchema);

