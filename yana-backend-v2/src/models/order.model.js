const mongoose = require("mongoose");    
 
const orderSchema = mongoose.Schema(
    {
    order_id: { 
        type: String, 
        required: true,
        unique: true, 
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },  
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    assigned_rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider",
        default: null,
    },
    orderWeek: {
        type: String,
        required: true,
        trim: true, 
    },
    meals: [
        {
            meal: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Meal",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            vendorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Admin',
                required: true,
            },
        },
    ],  
    phone: {
        type: String, 
    },
    instructions: {
        type: [String]
    },
    order_units: {
        type: Number,
        default: null,
    },
    order_complete_date: {
        type: Date,
        default: null,
    },
    delivery_location: {
        street1: String,
        street2: String,
        city: String,
        state: String,
        zip: String, 
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [lng, lat]
                required: true,
                default: [0, 0],
            },
        },
    }, 
    status: {
        type: String,
        trim: true,
        enum: [ 
        "pending",
        "active",
        "on the way",
        "completed",  
        "disputed",
        "canceled",
        "soft_delete"
        ],
        default: "pending",
    },  
    pod: {
        type: String,
        default: ''
    },
    mealPlan: {
        type: String,
        default: ''
    },
    },
    { timestamps: true }
);

orderSchema.index({ orderWeek: 1 }, { unique: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
