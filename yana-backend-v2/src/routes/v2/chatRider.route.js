const express = require('express'); 
const validate = require('../../middlewares/validate');
const { chatValidation } = require('../../validations');
const { chatController } = require('../../controllers'); 

const router = express.Router();

// chat users
router.get('/chat-users', chatController.getChatUsers);
 
// Get All Messages of a Chat
router.get('/chat-messages/:chatId', validate(chatValidation.getAllMessagesByChatId), chatController.getAllMessagesByChatId);

module.exports = router;