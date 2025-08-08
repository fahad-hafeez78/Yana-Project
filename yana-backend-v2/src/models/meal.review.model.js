const mongoose = require("mongoose"); 

const mealReviewSchema = mongoose.Schema(
    {
        customer: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Customer", 
            required: true 
        }, 
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Meal", 
            required: true 
        },
        order: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Order", 
            required: true 
        },
        rating: { 
            type: Number,  
            min: 1, 
            max: 5 
        },
        reviewText: { 
            type: String,  
            trim: true 
        },
    },
    { timestamps: true }
);

const MealReview = mongoose.model('Meal-Review', mealReviewSchema);
module.exports = MealReview;
