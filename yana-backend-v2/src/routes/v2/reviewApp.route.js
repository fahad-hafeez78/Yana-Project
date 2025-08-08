const express = require('express'); 
const validate = require('../../middlewares/validate');
const { reviewValidation } = require('../../validations');
const { reviewController } = require('../../controllers'); 

const router = express.Router();


// Customer All Reviews
router.get('/all', reviewController.customerAllReviews);
// Create Meal Review
router.post('/create-meal-review', validate(reviewValidation.customerCreateMealReview), reviewController.customerCreateMealReview);
// Create Support/Rider Review
router.post('/create-support-rider-review', validate(reviewValidation.customerCreateSupportRiderReview), reviewController.customerCreateSupportRiderReview);
// Reviews by Meal Id
router.get('/meal-reviews/:mealId', validate(reviewValidation.getReviewsByMealId), reviewController.getReviewsByMealId);

module.exports = router;