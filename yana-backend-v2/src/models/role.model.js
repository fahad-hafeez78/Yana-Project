const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    { 
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    parentRole: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role', 
    },
    parentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: true, 
        trim: true,
    }, 
    description: {
        type: String,
    },  
    permissions: [{
        page: { type: String, required: true },
        actions: [{ type: String, required: true }]  
    }],  
    hierarchyLevel: { 
        type: Number, 
        enum: [1, 2, 3], 
        required: true 
    },
}, 
{ 
  timestamps: true
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role; 
