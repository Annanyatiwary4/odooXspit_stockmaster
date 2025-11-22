import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
    customer: String,
    status: { type: String, default: "Draft" },

    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            qty: Number
        }
    ]
}, { timestamps: true });

export default mongoose.model("Delivery", deliverySchema);
