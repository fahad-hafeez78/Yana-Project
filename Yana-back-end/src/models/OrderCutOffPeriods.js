import mongoose from "mongoose";

const OrderCutOffPeriods = new mongoose.Schema({
    startDay: {
        type: String,
        required: [true, 'Start Day is required'],
    },
    closeDay: {
        type: String,
        required: [true, 'End Day is required'],
    },
}, {
    collection: 'OrderCutOffPeriods',
    timestamps: true,
});

export default mongoose.model('OrderCutOffPeriods', OrderCutOffPeriods);
