const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { riderValidation } = require('../../validations');
const { riderController } = require('../../controllers'); 
const upload = require('../../utils/multer');

const router = express.Router();

// Create Rider
router.post("/create", checkPermission("rider", "create"), upload.single("photo"), validate(riderValidation.createRider), riderController.createRider);
  
// Get All Riders
router.get("/all", checkPermission("rider", "view"), riderController.getAllRiders);
  
// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(checkPermission("rider", "view"), validate(riderValidation.getRider), riderController.getRider)
  .patch(checkPermission("rider", "edit"), upload.single("photo"), validate(riderValidation.updateRider), riderController.updateRider)
  .delete(checkPermission("rider", "delete"), validate(riderValidation.deleteRider), riderController.deleteRider);


module.exports = router;