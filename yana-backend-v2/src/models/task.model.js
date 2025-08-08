const mongoose = require("mongoose"); 

const taskSchema = mongoose.Schema(
    {
        task_id: { 
            type: String, 
            required: true,
            unique: true, 
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
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
            enum: ['pending', 'inprogress', 'completed'],
            default: 'pending'
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
