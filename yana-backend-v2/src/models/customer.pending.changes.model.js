const mongoose = require('mongoose'); 

const customerPendingChangesSchema = mongoose.Schema(
  { 
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    }, 
    field: {
      type: String,
      required: true
    },
    previousValue: {
      type: String,
      required: true
    },
    newValue: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
); 

const CustomerPendingChanges = mongoose.model('Customer-Pending-Changes', customerPendingChangesSchema);
module.exports = CustomerPendingChanges;
