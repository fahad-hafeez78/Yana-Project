const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { reviewValidation } = require('../../validations');
const { reviewController } = require('../../controllers'); 

const router = express.Router();
  
// All Reviews
// router.get('/all', checkPermission("review", "view"), reviewController.allReviews);
// Customers Reviews List
router.get('/customers-list', checkPermission("review", "view"), reviewController.customersList);
// Get Single Review by ID
router.post("/single/:id", checkPermission("review", "view"), validate(reviewValidation.getSingleReview), reviewController.getReview);
 // Update  
// router.patch("/update/:id", checkPermission("review", "edit"), validate(reviewValidation.updateReview), reviewController.updateReview);
// Delete 
router.delete("/delete/:id/:type", checkPermission("review", "delete"), validate(reviewValidation.deleteReview), reviewController.deleteReview);
// Get Customer Reviews
router.get('/customer-reviews/:customerId', checkPermission("review", "view"), validate(reviewValidation.getReviewsByCustomerId), reviewController.getReviewsByCustomerId);
// Get Meal Reviews
// router.get('/meal-reviews/:mealId', checkPermission("review", "view"), validate(reviewValidation.getReviewsByMealId), reviewController.getReviewsByMealId);


module.exports = router;