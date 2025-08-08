const { required } = require("joi");
const mongoose = require("mongoose"); 

const routeSchema = mongoose.Schema(
    {
        rider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rider",
            required: true,
        }, 
        vendorId: {  
            type: mongoose.Schema.Types.ObjectId,  
            ref: 'Admin',
            required: true,
        }, 
        stops: [{
            order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
            sequence: { type: Number, required: true },
            location: { type: [Number], required: true }, // [lng, lat]
            distance: { type: Number },  
            duration: { type: Number },  
            status: { type: String, enum: ['pending', 'delivered', 'canceled'], default: 'pending' },
            nextDestination: { type: Boolean, default: false }
        }],
        directions: {
            polyline: String,  
            distance: Number,
            duration: {
                hours: Number,
                minutes: Number
            }
        },  
        status: { 
            type: String, 
            enum: ['pending', 'assigned', 'inprogress', 'pause', 'completed'],
            default: 'pending' 
        },
        start_time: {
            type: Date,  
        }, 
    },
    { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;
