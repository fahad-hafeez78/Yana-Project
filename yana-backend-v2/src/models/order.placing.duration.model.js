const mongoose = require("mongoose");

const orderPlacingDurationSchema = new mongoose.Schema(
  {
    startDay: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    endDay: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
  },
  { timestamps: true }
);

const OrderPlacingDuration = mongoose.model("Order-Placing-Duration", orderPlacingDurationSchema);
module.exports = OrderPlacingDuration;
