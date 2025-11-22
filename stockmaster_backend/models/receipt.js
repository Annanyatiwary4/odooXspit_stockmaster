import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema({
    supplier: String,
    location: String,
    status: { type: String, default: "Draft" },

    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            qty: Number
        }
    ]
}, { timestamps: true });

export default mongoose.model("Receipt", receiptSchema);
