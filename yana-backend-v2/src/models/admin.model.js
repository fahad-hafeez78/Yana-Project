const mongoose = require('mongoose'); 

const adminSchema = mongoose.Schema(
  {  
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },   
    vendor_id: {
        type: String, 
    },
    name: {
      type: String,
      required: true, 
      trim: true
    },
    phone: {
        type: String, 
        required: true,
        unique: true,
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
        }
    },
    kitchen_address: {
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
    w9path: {
        type: String,  
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
        enum: ['active', 'inactive', 'soft_delete'],
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
    fcm: {
        type: String, 
        default: '',
    },
  },
  {
    timestamps: true,
  }
); 
   
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
