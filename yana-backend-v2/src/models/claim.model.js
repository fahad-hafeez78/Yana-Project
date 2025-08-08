const mongoose = require('mongoose');

const claimsSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    claim_num: {
      type: String,
      required: true,
      unique: true,
    },
    insurance: {
      type: String, 
    },
    created_date: {
      type: Date, 
    }, 
    from_dos: {
      type: Date,
    },
    to_dos: {
      type: Date,
    },  
    facility: {
      type: String,
    },
    status: {
      type: String,
      enum: ['in_process', 'denied', 'paid', 'partially_paid', 'billed'],
      default: 'in_process',
    },
    cpt: {
      type: String,
      required: true,
    }, 
    unit_price: {
      type: Number,
    },
    units: {
      type: Number,
    },
    days: {
      type: Number,
    },
    billed_amount: {
      type: Number,
    },
    allowed_amount: {
      type: Number,
    },
    paid_amount: {
      type: Number,
    },
    payment_date: {
      type: Date,
    },
    check: {
      type: String,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Claims = mongoose.model('Claims', claimsSchema);
module.exports = Claims;