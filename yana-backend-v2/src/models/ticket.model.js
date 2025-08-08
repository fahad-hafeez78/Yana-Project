const mongoose = require("mongoose"); 

const ticketSchema = mongoose.Schema(
    {
        ticket_id: { 
            type: String, 
            required: true,
            unique: true, 
        },
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['delivery issue', 'food quality', 'missing item', 'wrong order', 'other'], 
            required: true
        },
        description: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, 
        assignTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }, 
        status: {
            type: String,
            enum: ['pending', 'inprogress', 'solved'],
            default: 'pending'
        },
        image: {
            type: String,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
