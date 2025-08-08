const mongoose = require("mongoose"); 

const counterSchema = mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 999 }
});

const Counter = mongoose.model('Counter', counterSchema); 
module.exports = Counter;
