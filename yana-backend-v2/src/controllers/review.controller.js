const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { reviewService } = require('../services');

const customerCreateMealReview = catchAsync(async (req, res) => {
    const reviews = await reviewService.customerCreateMealReview(req.user, req.body);
    res.status(status.CREATED).send({ success: true, message: "Review Created Success", reviews });
});

const customerCreateSupportRiderReview = catchAsync(async (req, res) => {
    const review = await reviewService.customerCreateSupportRiderReview(req.user, req.body);
    res.status(status.CREATED).send({ success: true, message: "Review Created Success", review });
});
 
const allReviews = catchAsync(async (req, res) => { 
    const reviews = await reviewService.allReviews(req.user);
    res.status(status.OK).send({ success: true, message: "Reviews Fetched Successfully", reviews });
});

const customersList = catchAsync(async (req, res) => { 
    const customers = await reviewService.customersList(req.user);
    res.status(status.OK).send({ success: true, customers });
});

const customerAllReviews = catchAsync(async (req, res) => { 
    const reviews = await reviewService.customerAllReviews(req.user);
    res.status(status.OK).send({ success: true, message: "Reviews Fetched Successfully", reviews });
});
 
const getReviewsByCustomerId = catchAsync(async (req, res) => {
    const reviews = await reviewService.getReviewsByCustomerId(req.params.customerId);
    res.status(status.OK).send({ success: true, message: "Participant Reviews Fetched Successfully", reviews});
});

const getReviewsByMealId = catchAsync(async (req, res) => {
    const reviews = await reviewService.getReviewsByMealId(req.params.mealId);
    res.status(status.OK).send({ success: true, message: "Reviews Fetched Successfully", reviews});
});

const getReview = catchAsync(async (req, res) => {
    const review = await reviewService.getReviewById(req.params.id, req.body.type);
    res.status(status.OK).send({ success: true, message: "Review Fetched Successfully", review});
});
  
const updateReview = catchAsync(async (req, res) => {
    const review = await reviewService.updateReviewById(req.params.id, req.body);
    res.status(status.OK).send({ success: true, message: 'Review Updated Success', review});
});
  
const deleteReview = catchAsync(async (req, res) => {
    await reviewService.deleteReviewById(req.params.id, req.params.type);
    res.status(status.OK).send({ success: true, message: "Review Deleted Success"});
});

const getAllRiderReviews = catchAsync(async (req, res) => {
    const reviews = await reviewService.getAllRiderReviews(req.user);
    res.status(status.OK).send({ success: true, message: "Rider Reviews Fetched Successfully", reviews });
});


module.exports = {
    customerCreateMealReview, 
    customerCreateSupportRiderReview,
    allReviews, 
    customerAllReviews, 
    customersList,
    getReview,
    updateReview,
    deleteReview,
    getReviewsByCustomerId,
    getReviewsByMealId,
    getAllRiderReviews
}; 
