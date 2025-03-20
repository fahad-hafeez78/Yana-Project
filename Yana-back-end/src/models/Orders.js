// import mongoose from "mongoose";

// const addressSchema = new mongoose.Schema({
//   street1: {
//     type: String,
//     default: '',
//     maxlength: 255,
//   },
//   street2: {
//     type: String,
//     default: '',
//     maxlength: 255,
//   },
//   city: {
//     type: String,
//     default: '',
//     maxlength: 100,
//   },
//   state: {
//     type: String,
//     default: '',
//     maxlength: 100,
//   },
//   zipcode: {
//     type: String,
//     default: '',
//     maxlength: 20,
//   },
// }, { _id: false });

// const OrdersSchema = new mongoose.Schema({
  
//   participantId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Participants',
//     required: [true, 'Participant Id is required'],
//   },
//   meals: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Meals',
//     required: [true, 'At least one meal is required to place the order'],
//   }],
//   deliveryInstructions: {
//     type: [String],
//     default: [],
//   },
//   orderUnits: {
//     type: Number,
//     default: null,
//   },
//   placeDate: {
//     type: Date,
//     default: Date.now,
//   },
//   completeDate: {
//     type: Date,
//     default: null,
//   },
//   deliveryAddress: {
//     type: addressSchema,
//     default: {}
//   },
//   phone: {
//     type: String,
//     maxlength: 45,
//   },
//   status: {
//     type: String,
//     enum: ['Active', 'Pending', 'Completed', 'Disputed'],
//     required: [true, 'Status is required'],
//     default: 'Pending',
//   },
//   mealPlan: {
//     type: String,
//     default: '',
//     maxlength: 100,
//   },
// }, {
//   collection: 'Orders',
//   timestamps: true,
// });

// export default mongoose.model('Orders', OrdersSchema);

import mongoose from "mongoose";
const addressSchema = new mongoose.Schema({
  street1: {
    type: String,
    default: '',
    maxlength: 255,
  },
  street2: {
    type: String,
    default: '',
    maxlength: 255,
  },
  city: {
    type: String,
    default: '',
    maxlength: 100,
  },
  state: {
    type: String,
    default: '',
    maxlength: 100,
  },
  zipcode: {
    type: String,
    default: '',
    maxlength: 20,
  },
  country: {
    type: String,
    default: '',
    maxlength: 100,
  },
});

const OrdersSchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Participants',
  },
  participantName: {
    type: String,
    maxlength: 45,
    default: null,
  },
  mealIDsList: {
    type: [{
      mealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meals',
        required: true,
      },
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendors',
      },
      mealName: {
        type: String,
        maxlength: 100,
        required: true,
      },
      image: {
        type: String,
        maxlength: 255,
      },
      Count: {
        type: Number,
        required: true,
      },
    }],
    default: [],
  },
  DeliveryInstructions: {
    type: [String],
    maxlength: 45,
    default: null,
  },
  OrderUnits: {
    type: Number,
    default: null,
  },
  OrderPlaceDateTime: {
    type: Date,
    default: null,
  },
  OrderCompleteDateTime: {
    type: Date,
    default: null,
  },
  DeliveryAddress: {
    type: addressSchema,
    default: {}
  },
  Phone: {
    type: String,
    maxlength: 45,
  },
  Status: {
    type: String,
    maxlength: 45,
    default: null,
  },
  mealPlan: {
    type: String,
    default: '',
    maxlength: 100,
  },
}, {
  collection: 'Orders',
  timestamps: true,
});

export default mongoose.model('Orders', OrdersSchema);
