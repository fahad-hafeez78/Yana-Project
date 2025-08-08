const express = require('express'); 
const validate = require('../../middlewares/validate');
const { mealValidation } = require('../../validations');
const { mealController } = require('../../controllers');  

const router = express.Router();
     

// Get favorite Meals
router.get('/favorite-meals', mealController.favoriteMeals); 

router.post('/filter', validate(mealValidation.customerMeals), mealController.customerMeals);
   
// Add/Remove Meals to favorite
router.post('/favorites/toggle', validate(mealValidation.toggleFavorite), mealController.toggleFavorite); 

// Get by ID
router.get('/:id', validate(mealValidation.getSingleMeal), mealController.getSingleMeal);


module.exports = router;
 