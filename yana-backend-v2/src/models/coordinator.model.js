const mongoose = require('mongoose'); 

const coordinatorSchema = mongoose.Schema(
  { 
    name: {
        type: String, 
    }, 
    email: {
        type: String, 
    },
    phone: {
        type: String, 
    },
  },
  {
    timestamps: true,
  }
); 
   
const Coordinator = mongoose.model('Coordinator', coordinatorSchema);
module.exports = Coordinator;
