const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { chatValidation } = require('../../validations');
const { chatController } = require('../../controllers'); 

const router = express.Router();

// Create Chat
router.post('/create-chat', validate(chatValidation.createChat), chatController.createChat);
// Get All Chats of Current User
router.post('/all-chats', validate(chatValidation.getAllChatsOfUser), chatController.getAllChatsOfUser);
// Get All Messages of a Chat
router.get('/chat-messages/:chatId', validate(chatValidation.getAllMessagesByChatId), chatController.getAllMessagesByChatId);
// Get All Messages of a Ticket
router.get('/ticket-messages/:ticketId', validate(chatValidation.messagesByTicketId), chatController.messagesByTicketId);
    

module.exports = router;