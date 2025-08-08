const mongoose = require('mongoose'); 

const riderSchema = mongoose.Schema(
  {  
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true 
    }, 
    rider_id: {
        type: String, 
        required: true 
    }, 
    name: {
      type: String,
      required: true, 
      trim: true
    },
    phone: {
        type: String, 
        required: true, 
    },
    photo: {
        type: String,
        default: '', 
    }, 
    address: {
        street1: {
          type: String,
          trim: true,
        },
        street2: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        zip: {
            type: String,
            trim: true,
        }, 
    }, 
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
    },
    timezone: {
        type: String, 
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
    status: {
        type: String, 
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    otp: {
        type: String,
        default: '000000',
        maxlength: 6,
    },
    otpExpiry: {
        type: Date,
    },
    vehicle_no: {
        type: String,  
        required: true,
    },
    vehicle_model: {
        type: String,  
    }, 
    last_location_update: {
        type: Date
    },
    fcm: {
        type: String, 
        default: '',
    },
  },
  {
    timestamps: true,
  }
); 
   
const Rider = mongoose.model('Rider', riderSchema);
module.exports = Rider;
