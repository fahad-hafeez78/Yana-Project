const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { vendorValidation } = require('../../validations');
const { vendorController, umsController } = require('../../controllers');  
const upload = require('../../utils/multer');

const router = express.Router();
   
// Create
// router.post('/', checkPermission("vendor", "create"), upload.fields([{name: 'photo', maxCount: 1}, {name: 'w9path', maxCount: 1}]), validate(vendorValidation.createVendor), umsController.createAdminUser);
// Get All Vendors
router.get('/all', checkPermission("vendor", "view"), vendorController.allVendors);
 
// Soft Delete Vendor
router.patch('/soft-delete/:id', checkPermission("vendor", "delete"), validate(vendorValidation.deleteVendor), vendorController.softDeleteVendor);
// Fetch Deleted Vendors List
router.get('/deleted-vendors', vendorController.getDeletedVendors);
// Permanent Delete Vendor
router.delete('/permanent-delete/:id', validate(vendorValidation.deleteVendor), vendorController.deleteVendor);

// Get by ID, Update  
router
  .route('/:id')
  .get(checkPermission("vendor", "view"), validate(vendorValidation.getVendor), vendorController.getVendor)
  .patch(checkPermission("vendor", "edit"), upload.fields([{name: 'photo', maxCount: 1}, {name: 'w9path', maxCount: 1}]), validate(vendorValidation.updateVendor), vendorController.updateVendor);
  


module.exports = router;