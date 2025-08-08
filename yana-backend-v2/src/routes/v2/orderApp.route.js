const express = require('express'); 
const validate = require('../../middlewares/validate');
const { orderValidation } = require('../../validations');
const { orderController } = require('../../controllers'); 

const router = express.Router();


// All Orders of Customer
router.get("/all", orderController.customerAllOrders);
// Get Order Placing Duration
router.get('/order-placing-duration', orderController.getOrderPlacingDuration);
// Create
router.post('/create', validate(orderValidation.createOrderApp), orderController.createOrderApp);
// Update Order by ID
router.put("/update/:id", validate(orderValidation.updateOrder), orderController.customerUpdateOrder);
// Get Order by ID
router.get('/single/:id', validate(orderValidation.getOrderById), orderController.getOrderById);
// Track Order
router.get('/track-order', orderController.trackOrder);


module.exports = router;