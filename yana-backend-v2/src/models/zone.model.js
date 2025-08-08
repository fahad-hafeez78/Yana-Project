const mongoose = require("mongoose"); 

const zoneSchema = mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true,
            maxlength: 50 
        }, 
    },
    { timestamps: true }
);

const Zone = mongoose.model('Zone', zoneSchema);
module.exports = Zone;
