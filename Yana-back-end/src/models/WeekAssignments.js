// models/WeekAssignment.js
// const mongoose = require("mongoose");
import mongoose from "mongoose";
const MenuSchema = new mongoose.Schema(
  {
    MenuID: {
      type: mongoose.Schema.Types.ObjectId, // or String if not ObjectId
      required: true,
      ref: "Menu",
    },
    MenuName: {
      type: String,
    },
  },
  { _id: false }
);

const WeekSchema = new mongoose.Schema(
  {
    Startdt: {
      type: String,
    },
    Enddt: {  // Fixed the duplicate Startdt field by adding Enddt
      type: String,
    },
    Menus: {
      type: [MenuSchema],
    },
  },
  { _id: false }
);

const WeekAssignmentSchema = new mongoose.Schema({
  week1: {
    type: [WeekSchema],
  },
  week2: {
    type: [WeekSchema],
  },
  week3: {
    type: [WeekSchema],
  },
  week4: {
    type: [WeekSchema],
  },
});

export default mongoose.model("WeekAssignments", WeekAssignmentSchema);