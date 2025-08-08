const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { menuValidation } = require('../../validations');
const { menuController } = require('../../controllers'); 
const upload = require('../../utils/multer'); 

const router = express.Router();
  
// Create and Get All
router
  .route('/')
  .post(checkPermission("menu", "create"), upload.single('image'), validate(menuValidation.createMenu), menuController.createMenu)
  .get(checkPermission("menu", "view"), menuController.getAllMenus);

// Menus by vendor id
router.get('/vendor-menus/:vendorId', checkPermission("menu", "view"), validate(menuValidation.vendorMenus), menuController.vendorMenus);
  
// Assign Menu
router.post('/fetch-assigned-menus', checkPermission("menu", "menuAssign"), validate(menuValidation.fetchAssignedMenus), menuController.fetchAssignedMenus);
router.post('/update-assigned-menus', checkPermission("menu", "menuAssign"), validate(menuValidation.createOrUpdateAssignMenu), menuController.createOrUpdateAssignMenu);

// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(checkPermission("menu", "view"), validate(menuValidation.getSingleMenu), menuController.getMenuById)
  .patch(checkPermission("menu", "edit"), upload.single('image'), validate(menuValidation.updateMenu), menuController.updateMenu)
  .delete(validate(menuValidation.deleteMenu), menuController.deleteMenu);
//checkPermission("menu", "delete")

module.exports = router;