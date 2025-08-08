const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { umsValidation } = require('../../validations');
const { umsController } = require('../../controllers'); 
const upload = require('../../utils/multer');

const router = express.Router();

// LoggedIn Admin User
router.get('/me', umsController.loggedInUser);
    
// Create
router.post('/create-user', checkPermission("user", "create"), upload.fields([{name: 'photo', maxCount: 1}, {name: 'w9path', maxCount: 1}]), validate(umsValidation.createAdminUser), umsController.createAdminUser);

// Get All
router.get('/all', checkPermission("user", "view"), validate(umsValidation.allAdminUsers), umsController.allAdminUsers);

// Get All Users by Role Id
router.get('/users-by-roleId', validate(umsValidation.usersByRoleId), umsController.usersByRoleId);

router.patch('/update-status-by-admin/:id', checkPermission("user", "edit"), validate(umsValidation.updateStatusByAdmin), umsController.updateStatusByAdmin);



// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(checkPermission("user", "view"), validate(umsValidation.getAdminUser), umsController.getAdminUser)
  .patch(checkPermission("user", "edit"), upload.fields([{name: 'photo', maxCount: 1}, {name: 'w9path', maxCount: 1}]), validate(umsValidation.updateAdminUser), umsController.updateAdminUser)
  .delete(checkPermission("user", "delete"), validate(umsValidation.deleteAdminUser), umsController.deleteAdminUser);


module.exports = router;