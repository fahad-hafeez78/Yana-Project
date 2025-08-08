const express = require('express'); 
const validate = require('../../middlewares/validate');
const { routeValidation } = require('../../validations');
const { routeController } = require('../../controllers'); 
const upload = require('../../utils/multer');

const router = express.Router();
  
// Get Latest/New Route for customer
router.get("/new", routeController.getCustomerNewRoute);  

module.exports = router;