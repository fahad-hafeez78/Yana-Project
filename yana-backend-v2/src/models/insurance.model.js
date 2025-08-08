const mongoose = require('mongoose'); 

const insuranceSchema = mongoose.Schema(
  { 
    mcpt: {
        type: String, 
    },
    m_auth_units_approved: {
        type: String, 
    },
    m_frequency: {
        type: String, 
    },
    pcpt: {
        type: String, 
    },
    p_auth_units_approved: {
        type: String, 
    },
    p_frequency: {
        type: String, 
    },
    note: {
        type: String, 
    },
    mealPlan: {
        type: String, 
    },
  },
  {
    timestamps: true,
  }
); 
   
const Insurance = mongoose.model('Insurance', insuranceSchema);
module.exports = Insurance;
