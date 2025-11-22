import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
    customer: String,
    status: { 
        type: String, 
        enum: ["Draft", "Confirmed", "Picking", "Packing", "Ready", "Validated", "Cancelled"],
        default: "Draft" 
    },
    deliveryNumber: String,
    notes: String,
    
    // Picking details
    pickingStatus: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
    assignedPicker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pickingCompletedAt: Date,
    
    // Packing details
    packingStatus: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
    assignedPacker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    packingCompletedAt: Date,
    
    // Validation
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    validatedAt: Date,

    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            qty: Number,
            pickedQty: { type: Number, default: 0 },
            packedQty: { type: Number, default: 0 }
        }
    ]
}, { timestamps: true });

export default mongoose.model("Delivery", deliverySchema);
