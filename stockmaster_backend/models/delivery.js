const mongoose = require("mongoose");

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

module.exports = mongoose.model("Delivery", deliverySchema);
