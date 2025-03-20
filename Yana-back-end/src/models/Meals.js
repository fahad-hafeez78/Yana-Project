import mongoose from "mongoose";
// import { generateNumericId } from "../utils/idGenerator.js";

const mealsSchema = new mongoose.Schema({

  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Vendor id is required"],
  },
  vendorName: {
    type: String,
    required: [true, "Vendor Name is required"],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  title: {
    type: String,
    required: [true, "Meal name is required"],
    unique: [true, "Meal title already exists"],
  },
  category: {
    type: String,
    required: [true, "category is required"],
    enum: ['BreakFast', 'Lunch', 'Dinner'],
  },
  description: {
    type: String,
    maxlength: 255,
    default: null,
  },
  tags: {
    type: [String],
    default: [],
  },
  details: {
    type: String,
    default: null,
  },
  rating: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: [true, "status is required"],
    enum: ['Available', 'Unavailable'],
  },
  nutritionInfo: {
    type: String,
    default: null,
  },
  allergies: {
    type: String,
    default: null,
  },
}, {
  collection: 'Meals',
  timestamps: true,
});

export default mongoose.model('Meals', mealsSchema);
