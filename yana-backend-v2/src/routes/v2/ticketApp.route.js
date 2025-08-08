const express = require('express'); 
const validate = require('../../middlewares/validate');
const { ticketValidation } = require('../../validations');
const { ticketController } = require('../../controllers'); 
const upload = require('../../utils/multer');

const router = express.Router();

// Create Ticket
router.post('/create', upload.single('image'), validate(ticketValidation.createTicket), ticketController.createTicket);
// All Ticket
router.get('/customer-all', ticketController.customerAllTickets);
// Get by ID
router.get('/single/:id', validate(ticketValidation.getTicket), ticketController.getTicket); 


module.exports = router;