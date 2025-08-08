const mongoose = require('mongoose'); 

const customerSchema = mongoose.Schema(
  { 
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
    coordinator: {  
      type: mongoose.Schema.Types.ObjectId,  
      ref: 'Coordinator'
    },
    insurance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Insurance' 
    },
    vendorId: {  
      type: mongoose.Schema.Types.ObjectId,  
      ref: 'Admin'
    },
    // zone: {  
    //   type: mongoose.Schema.Types.ObjectId,  
    //   ref: 'Zone'
    // },
    fcm: {
      type: String,
      default: ""
    },
    customer_id: {
      type: String,
      required: true,
      unique: true,
    },
    memberId: {
      type: String,
      required: true
    },
    medicaidId: {
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
      unique: true,
      sparse: true, 
    },
    photo: {
      type: String,
      default: '', 
    }, 
    insuranceCardPhoto: {
      type: String, 
    },
    address: {
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
    alternate_contact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relation: {
        type: String,
        trim: true,
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
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'], 
    },
    allergies: {
      type: [String]
    },
    dob: {
      type: Date, 
    },
    io_type: {
      type: String, 
    },
    auth_number_facets: {
      type: String, 
    },
    start_date: {
      type: Date, 
    },
    end_date: {
      type: Date, 
    },
    icd10code: {
      type: String, 
    },
    status: {
      type: String, 
      enum: ['active', 'inactive', 'approved', 'pending'],
      default: 'pending',
      required: true,
    },
    pers_status: {
      type: String, 
      enum: ['active', 'inactive', 'empty', 'unassigned'], 
      default: 'unassigned'
    },
    pauseStartDt: {
      type: Date, 
    },
    pauseEndDt: {
      type: Date, 
    },
    otp: {
      type: String,
      default: '000000',
      maxlength: 6,
    },
    otpExpiry: {
      type: Date,
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
    }],
  },
  {
    timestamps: true,
  }
); 
 
const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;