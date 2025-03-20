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

const VendorSchema = new mongoose.Schema({
  Username: {
    type: String,
    maxlength: 45,
  },
  Password: {
    type: String,
    maxlength: 64,
  },
  Name: {
    type: String,
    maxlength: 45,
    required: true,
  },
  Phone: {
    type: String,
    maxlength: 45,
    required: true,
    unique: true,
  },
  Email: {
    type: String,
    maxlength: 45,
    required: true,
    unique: true,
  },
  Address: {
    type: addressSchema,
    default: {}
  },
  image: {
    type: String,
    maxlength: 255,
    default: null,
  },
  W9Path: {
    type: String,
    maxlength: 255,
    default: null,
  },
  Rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  Role: {
    type: String,
    default: 'Vendor',
    required: true,
  },
  Status: {
    type: String,
    maxlength: 45,
    default: "Active",
  },
  OTP: {
    type: String,
    default: '000000',
    maxlength: 6,
  },
}, {
  collection: 'Vendors',
  timestamps: true,
});

export default mongoose.model('Vendors', VendorSchema);
