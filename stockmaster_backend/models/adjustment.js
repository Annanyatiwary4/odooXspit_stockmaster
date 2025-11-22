import mongoose from "mongoose";

const adjustmentSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    location: String,
    systemQty: Number,
    countedQty: Number,
    reason: String
}, { timestamps: true });

export default mongoose.model("Adjustment", adjustmentSchema);
