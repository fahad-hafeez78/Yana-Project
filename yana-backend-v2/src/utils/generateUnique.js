const Counter = require('../models/counter.model'); 

const generateUniqueId = async (counterName) => {
    try {
        const counter = await Counter.findByIdAndUpdate(
            { _id: counterName },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        // return counter.seq; // Returns numeric ID (e.g., 1000, 1001, 1002...)
        return `${counterName}-${counter.seq}`;  
    } catch (error) {
        throw new Error("Error generating unique ID");
    }
};

module.exports = generateUniqueId;
