import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
    name: String,
    code: String,
    address: String
}, { timestamps: true });

export default mongoose.model("Warehouse", warehouseSchema);
