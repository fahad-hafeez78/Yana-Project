const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { customerValidation } = require('../../validations');
const { customerController } = require('../../controllers'); 
const upload = require('../../utils/multer'); 

const router = express.Router();
  
// Import Customer/Participant
router.post('/import', checkPermission("participant", "import"), upload.single('importFile'), customerController.importCustomers);
 
// Create and Get All
router
  .route('/')
  .post(checkPermission("participant", "create"), validate(customerValidation.createCustomer), customerController.createCustomer)
  .get(checkPermission("participant", "view"), validate(customerValidation.getCustomers), customerController.getCustomers);

// generate credentials for customer
router.post('/generate-credentials', checkPermission("participant", "generateCredentials"), validate(customerValidation.generateCredential), customerController.generateCredential);

// Pending Changes
router.get('/all-pending-changes', checkPermission("participant_changes", "view"), customerController.getAllPendingChanges);
router.post('/pending-changes/:id', checkPermission("participant_changes", "edit"), validate(customerValidation.applyCustomerChanges), customerController.applyCustomerChanges);

// Customer Requests
router.get('/all-requests', checkPermission("participant_requests", "view"),validate(customerValidation.getAllRequests), customerController.getAllRequests);
router.post('/request-action', checkPermission("participant_requests", "edit"), validate(customerValidation.requestAction), customerController.requestAction);

// Customer Bulk Status Update
router.put('/bulk-status-update', checkPermission("participant", "edit"), validate(customerValidation.bulkStatusUpdate), customerController.bulkStatusUpdate);

// Single Customer status update
// router.put('/status/:id', checkPermission("participant", "edit"), validate(customerValidation.updateCustomerStatus), customerController.updateCustomerStatus);

//get pers customers
router.get('/all-pers-customers', checkPermission("pers", "view"), validate(customerValidation.getPersCustomers), customerController.getPersCustomers);

// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(checkPermission("participant", "view"), validate(customerValidation.getCustomer), customerController.getCustomer)
  .put(checkPermission("participant", "edit"), validate(customerValidation.updateCustomer), customerController.updateCustomer)
  // .delete(checkPermission("participant", "delete"), validate(customerValidation.deleteCustomer), customerController.deleteCustomer);
  

module.exports = router;