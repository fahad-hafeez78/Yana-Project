const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    { 
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat', 
        default: null
      },
      ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        default: null
      },
      text: {
        type: String, 
      },
      messageType: {
        type: String,
        enum: ['text', 'image', 'document', 'audio'],
        default: 'text',
      },
      mediaUrl: { 
        type: String
     },
      isRead: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
);
  
messageSchema.index({ chat: 1 });
 
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
