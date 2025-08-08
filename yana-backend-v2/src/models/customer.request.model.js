const mongoose = require('mongoose'); 

const customerRequestSchema = mongoose.Schema(
    {
        customer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
          required: true,
        },  
        type: {
          type: String,
          enum: ['delete', 'status', 'pause'],
          required: true,
        },
        pauseStartDt: {
          type: Date, 
        }, 
        pauseEndDt: {
          type: Date,
        },
        request: {
          type: String,
          required: true,
        },
        status: {  
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
    },
  {
    timestamps: true,
  }
); 
   
const CustomerRequest = mongoose.model('Customer-Request', customerRequestSchema);
module.exports = CustomerRequest;
