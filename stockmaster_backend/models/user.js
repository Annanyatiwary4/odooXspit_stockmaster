import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["admin", "manager", "staff"], default: "staff" },
    isActive: { type: Boolean, default: true },
    assignedWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" } // For staff assignment
}, { timestamps: true });

export default mongoose.model("User", userSchema);
