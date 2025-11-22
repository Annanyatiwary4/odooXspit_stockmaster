import mongoose from "mongoose";

const transferSchema = new mongoose.Schema({
    from: String, // warehouse or rack
    to: String,
    status: { type: String, default: "Draft" },

    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            qty: Number
        }
    ]
}, { timestamps: true });

export default mongoose.model("Transfer", transferSchema);
