const mongoose = require("mongoose"); 

const supportRiderReviewSchema = mongoose.Schema(
    {
        customer: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Customer", 
            required: true 
        }, 
        rider: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Rider"
        },
        order: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Order", 
            required: true 
        },
        rider_rating: { 
            type: Number,  
            min: 0, 
            max: 5 
        },
        support_rating: { 
            type: Number,  
            min: 0, 
            max: 5 
        },
        rider_text: { 
            type: String,  
            trim: true 
        },
        support_text: { 
            type: String,  
            trim: true 
        },
    },
    { timestamps: true }
);

const SupportRiderReview = mongoose.model('Support-Rider-Review', supportRiderReviewSchema);
module.exports = SupportRiderReview;
