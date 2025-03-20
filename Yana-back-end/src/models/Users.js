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
});

const usersSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username already exists"],
    maxlength: 45,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    unique: [true, "Password already exists"],
    maxlength: 64,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    unique: [true, "Name already exists"],
    maxlength: 45,
  },
  phone: {
    type: String,
    maxlength: 45,
    unique: [true, "Phone number already exists"],
  },
  email: {
    type: String,
    unique: [true, "Email address already exists"],
    maxlength: 45,
  },
  image: {
    type: String,
    default: '',
    maxlength: 255,
  },
  W9Path: {
    type: String,
  },
  Address: {
    type: addressSchema,
    default: {}
  },
  Timezone: {
    type: String,
    default: '',
    maxlength: 255,
  },
  Gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false,
  },
  Role: {
    type: String,
  },
  Status: {
    type: String,
    maxlength: 45,
  },
  OTP: {
    type: String,
    default: '000000',
    maxlength: 6,
  },
}, {
  collection: 'Users',
  timestamps: true, // This will automatically add `createdAt` and `updatedAt` fields
});

export default mongoose.model('Users', usersSchema);
