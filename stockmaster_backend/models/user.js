import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'manager', 'warehouse'], 
        default: 'warehouse' 
    },
    assignedWarehouse: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Warehouse', 
        default: null 
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Index for faster searches
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export default mongoose.model("User", userSchema);
