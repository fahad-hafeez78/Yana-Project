const express = require('express'); 
const validate = require('../../middlewares/validate');
const { chatValidation } = require('../../validations');
const { chatController } = require('../../controllers'); 

const router = express.Router();
 
// Get All Messages of a Ticket
router.get('/ticket-messages/:ticketId', validate(chatValidation.messagesByTicketId), chatController.messagesByTicketId);
    

module.exports = router;