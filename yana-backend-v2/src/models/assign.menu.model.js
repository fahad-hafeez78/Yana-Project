const mongoose = require("mongoose"); 

const assignMenuSchema = mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            unique: true,
            required: true,
        },
        assignments: [
            {
                startDate: {
                    type: Date,
                    required: true,
                },
                endDate: {
                    type: Date,
                    required: true,
                },
                menus: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Menu',
                        required: true
                    }
                ], 
            }
        ]
    },
    { 
        timestamps: true,
        // Add validation to ensure no more than 4 assignments
        validate: {
            validator: function(v) {
                return this.assignments.length <= 4;
            },
            message: 'Cannot have more than 4 menu assignments!'
        }
    }
);

const AssignMenu = mongoose.model('Assign-Menu', assignMenuSchema);
module.exports = AssignMenu;