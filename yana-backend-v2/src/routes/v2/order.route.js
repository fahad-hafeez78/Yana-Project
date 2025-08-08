const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { orderValidation } = require('../../validations');
const { orderController } = require('../../controllers'); 

const router = express.Router();
 
// Create
router.post('/create', checkPermission("order", "create"), validate(orderValidation.createOrderAdmin), orderController.createOrderAdmin);

// All Orders
router.get('/all', checkPermission("order", "view"), orderController.getAllOrders);

// Export (vendor meals stats by order status)
router.get('/vendor-meals-stats/:vendorId/:status', checkPermission("order", "export"), validate(orderValidation.vendorMealsStats), orderController.vendorMealsStats);

// Order Placing Duration
router.get('/order-placing-duration', checkPermission("order", "view"), orderController.getOrderPlacingDuration);
router.put('/update-order-placing-duration', checkPermission("order", "edit"), orderController.updateOrderPlacingDuration);
 
// Update Active Order Status to Complete
// router.patch('/update-status-to-complete/:id', checkPermission("order", "edit"), validate(orderValidation.updateOrderStatusById), orderController.updateOrderStatusToComplete);

// Bulk status update
router.put('/bulk-status-update', checkPermission("order", "edit"), validate(orderValidation.bulkStatusUpdate), orderController.bulkStatusUpdate);

// Fetch Soft deleted orders
router.get('/soft-deleted-orders', orderController.getSoftDeletedOrders);

// Update by Id
router.patch('/:id', checkPermission("order", "edit"), validate(orderValidation.updateOrder), orderController.updateOrder);
// Get by ID  
router.get('/:id', checkPermission("order", "view"), validate(orderValidation.getOrderById), orderController.getOrderById);

// Soft Delete
router.patch('/soft-delete/:id', checkPermission("order", "delete"), validate(orderValidation.deleteOrder), orderController.softDeleteOrder);
// Permanent Delete
router.delete('/permanent-delete/:id', validate(orderValidation.deleteOrder), orderController.deleteOrder);

// Fetch latest orders of a customer by customer id
router.get('/latest-orders/:customerId', checkPermission("order", "view"), orderController.getLatestOrdersByCustomerId);


module.exports = router;