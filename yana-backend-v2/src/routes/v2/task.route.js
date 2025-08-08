const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { taskValidation } = require('../../validations');
const { taskController } = require('../../controllers'); 
const upload = require('../../utils/multer'); 

const router = express.Router();

// Create Task
router.post('/create', checkPermission("task", "create"), upload.single('image'), validate(taskValidation.createTask), taskController.createTask);
// Get All Tasks
router.post('/all-tasks', checkPermission("task", "view"), validate(taskValidation.allTasks), taskController.allTasks);
  
// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(checkPermission("task", "view"), validate(taskValidation.getTask), taskController.getTask)
  .patch(checkPermission("task", "edit"), upload.single('image'), validate(taskValidation.updateTask), taskController.updateTask)
  .delete(checkPermission("task", "delete"), validate(taskValidation.deleteTask), taskController.deleteTask);


module.exports = router;