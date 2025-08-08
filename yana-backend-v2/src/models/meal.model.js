const mongoose = require("mongoose"); 

const mealSchema = mongoose.Schema(
    {   
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        }, 
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["breakfast", "lunch", "dinner"],
            required: true,
            maxlength: 45,
        },
        price: {
            type: Number
        }, 
        tags: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            maxlength: 255
        },
        ingredients: {
            type: [String],
            maxlength: 255
        },
        nutrition_info: {
            type: [String],
            maxlength: 255
        },
        allergies: {
            type: [String],
            maxlength: 255
        }, 
        status: {
            type: String,
            required: true,
            enum: ["active", "inactive"],
            default: "active"
        } 
    },
    { timestamps: true }
);

const Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;
