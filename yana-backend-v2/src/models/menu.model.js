const mongoose = require("mongoose"); 


const menuSchema = mongoose.Schema(
    { 
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        name: { 
            type: String, 
            required: true, 
            maxlength: 50 
        },
        image: { 
            type: String
        },
        meals: [
            { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Meal',
                required: true
            }
        ]
    },
    { timestamps: true }
);

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
