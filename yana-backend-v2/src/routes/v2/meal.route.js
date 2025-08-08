const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { mealValidation } = require('../../validations');
const { mealController } = require('../../controllers'); 
const upload = require('../../utils/multer'); 

const router = express.Router();
   
// Create a meal
router.post('/', checkPermission("meal", "create"), upload.single('image'), validate(mealValidation.createMeal), mealController.createMeal);
// Get All Meals
router.get('/all', checkPermission("meal", "view"), mealController.allMeals);
// Meals by vendor id
router.get('/vendor-meals/:vendorId', checkPermission("meal", "view"), validate(mealValidation.vendorMeals), mealController.vendorMeals);

// Assigned Week Active meals by vendor id
router.get('/assigned-week/active-meals/:vendorId', validate(mealValidation.vendorMeals), mealController.assignedWeekActiveMeals);

// Filter
// router.post('/filter', checkPermission("meal", "filter"), validate(mealValidation.filterMeals), mealController.filterMeals);

// Delete    checkPermission("meal", "delete")
router.delete("/delete/:id", validate(mealValidation.deleteMeal), mealController.deleteMealById);

// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(checkPermission("meal", "view"), validate(mealValidation.getSingleMeal), mealController.getSingleMeal)
  .patch(checkPermission("meal", "edit"), upload.single('image'), validate(mealValidation.updateMeal), mealController.updateMeal);
  

module.exports = router;
 