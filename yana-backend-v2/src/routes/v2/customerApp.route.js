const express = require('express');
const { auth } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { customerValidation } = require('../../validations');
const { customerController } = require('../../controllers');  
const upload = require('../../utils/multer');

const router = express.Router();
 
// LoggedIn Customer
router.get('/me', customerController.loggedInCustomerDetails);

// Update Customer Photo
router.patch('/update', upload.single('photo'), customerController.updateCustomerPhoto);

// Create Request to Admin (delete, active, inactive account)
router.post('/create-request', validate(customerValidation.createRequest), customerController.createRequest);
    

module.exports = router;