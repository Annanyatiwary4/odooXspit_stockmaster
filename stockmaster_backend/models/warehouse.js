import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: ['rack', 'shelf', 'bin', 'zone', 'area'], default: 'area' },
    capacity: { type: Number, default: null },
    parentLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null }
}, { timestamps: true });

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true, uppercase: true },
    address: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    locations: [locationSchema],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Index for faster searches
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ status: 1 });

export default mongoose.model("Warehouse", warehouseSchema);
