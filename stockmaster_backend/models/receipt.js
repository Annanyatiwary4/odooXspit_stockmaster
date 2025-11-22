import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema({
    supplier: String,
    location: String,
    status: { 
        type: String, 
        enum: ["Draft", "Confirmed", "Validated", "Cancelled"],
        default: "Draft" 
    },
    receiptNumber: String,
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    validatedAt: Date,

    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            qty: Number
        }
    ]
}, { timestamps: true });

export default mongoose.model("Receipt", receiptSchema);
