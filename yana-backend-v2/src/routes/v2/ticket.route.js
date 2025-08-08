const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { ticketValidation } = require('../../validations');
const { ticketController } = require('../../controllers'); 

const router = express.Router();

// Get All Tickets
router.get('/all', checkPermission("ticket", "view"), validate(ticketValidation.allTickets), ticketController.allTickets);
  
// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(checkPermission("ticket", "view"), validate(ticketValidation.getTicket), ticketController.getTicket)
  .patch(checkPermission("ticket", "edit"), validate(ticketValidation.updateTicket), ticketController.updateTicket); 


module.exports = router;