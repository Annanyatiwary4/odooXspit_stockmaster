import mongoose from "mongoose";

const deliveryItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0 },
    pickedQuantity: { type: Number, default: 0 },
    packedQuantity: { type: Number, default: 0 },
    locationId: { type: String, required: true }, // Source location ID
    unitPrice: { type: Number, default: 0 },
    notes: { type: String, default: "" }
}, { _id: true });

const deliverySchema = new mongoose.Schema({
    deliveryNumber: { type: String, unique: true, required: true },
    customer: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    deliveryAddress: { type: String, default: "" },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    items: [deliveryItemSchema],
    status: { 
        type: String, 
        enum: ['draft', 'waiting', 'picking', 'packing', 'ready', 'done', 'canceled'], 
        default: 'draft' 
    },
    deliveryDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date, default: null },
    referenceNumber: { type: String, default: "" },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pickedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    packedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    validatedAt: { type: Date, default: null }
}, { timestamps: true });

// Index for faster searches
deliverySchema.index({ deliveryNumber: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ warehouseId: 1 });
deliverySchema.index({ customer: 1 });
deliverySchema.index({ createdAt: -1 });

export default mongoose.model("Delivery", deliverySchema);
