const Joi = require('joi');
const { objectId } = require('./custom.validation');
const mongoose = require('mongoose'); 


const customerCreateMealReview = {
    body: Joi.object().keys({ 
        orderId: Joi.string().required().custom(objectId),  
        reviews: Joi.array().items(
            Joi.object({  
                meal: Joi.string().required().custom(objectId), 
                rating: Joi.number().min(1).max(5).optional(), 
                reviewText: Joi.string().allow('').optional(),
            })
        ).min(1).required(),
    }),
};

const customerCreateSupportRiderReview = {
    body: Joi.object().keys({  
        rider: Joi.string()
            .allow(null, '') // allow empty string or null
            .optional()
            .custom((value, helpers) => {
                if (value === '' || value === null) return value;
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.error("any.invalid");
                }
                return value;
            }, 'ObjectId validation'), 
        order: Joi.string().required().custom(objectId),  
        rider_rating: Joi.number().min(0).max(5).optional(),
        support_rating: Joi.number().min(0).max(5).optional(), 
        rider_text: Joi.string().allow(null, '').optional(),
        support_text: Joi.string().allow(null, '').optional(),
    }),
};

const getSingleReview = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({  
        type: Joi.string().valid('meal', 'support-rider').required(), 
    }),
};

const updateReview = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({ 
        type: Joi.string().valid('meal', 'support-rider').required(),  
        meal: Joi.string().custom(objectId).optional(),  
        rating: Joi.number().min(1).max(5).optional(), 
        reviewText: Joi.string().trim().optional(),   
        rider_rating: Joi.number().min(1).max(5).optional(), 
        support_rating: Joi.number().min(1).max(5).optional(), 
        rider_text: Joi.string().allow('').optional(),
        support_text: Joi.string().allow('').optional(),
    }).min(1),
};
  
const deleteReview = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
        type: Joi.string().valid('meal', 'support-rider').required(), 
    }), 
};

const getReviewsByCustomerId = {
    params: Joi.object().keys({
      customerId: Joi.string().required().custom(objectId),
    }),
  };
  
const getReviewsByMealId = {
    params: Joi.object().keys({
        mealId: Joi.string().required().custom(objectId),
    }),
};
   
module.exports = {
    customerCreateMealReview,
    customerCreateSupportRiderReview,
    getSingleReview,
    getReviewsByCustomerId,
    getReviewsByMealId,
    updateReview,
    deleteReview
};