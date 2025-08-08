const express = require('express'); 
const validate = require('../../middlewares/validate');
const { orderValidation } = require('../../validations');
const { orderController } = require('../../controllers'); 

const router = express.Router();
 
// Get Order by ID
router.get('/single/:id', validate(orderValidation.getOrderById), orderController.getOrderById);
 

module.exports = router;