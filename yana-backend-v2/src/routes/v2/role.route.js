const express = require('express');
const { rolePermissionSubset, isAdminRole } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { roleValidation } = require('../../validations');
const { roleController } = require('../../controllers'); 

const router = express.Router();
   
// Create and Get All
router.post("/create", isAdminRole, rolePermissionSubset, validate(roleValidation.createRole), roleController.createRole)
router.get("/all", isAdminRole, roleController.allRoles);

// All Roles for dropdown listing without permissions 
router.get("/dropdown-listing", validate(roleValidation.dropDown), roleController.dropDownListing); 
     
// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(isAdminRole, validate(roleValidation.getRole), roleController.getRole)
  .put(isAdminRole, rolePermissionSubset, validate(roleValidation.updateRole), roleController.updateRole)
  .delete(isAdminRole, validate(roleValidation.deleteRole), roleController.deleteRole);


module.exports = router;