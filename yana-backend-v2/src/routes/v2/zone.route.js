const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { zoneValidation } = require('../../validations');
const { zoneController } = require('../../controllers'); 

const router = express.Router();

// Create
router.post('/create', checkPermission("zone", "create"), validate(zoneValidation.createZone), zoneController.createZone);
// Get All
router.get('/all', checkPermission("zone", "view"), zoneController.getAllZones);
  
// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(checkPermission("zone", "view"), validate(zoneValidation.getZone), zoneController.getZone)
  .patch(checkPermission("zone", "edit"), validate(zoneValidation.updateZone), zoneController.updateZone)
  .delete(checkPermission("zone", "delete"), validate(zoneValidation.deleteZone), zoneController.deleteZone);


module.exports = router;