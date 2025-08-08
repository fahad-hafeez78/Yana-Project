const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrderAdmin = {
    body: Joi.object().keys({  
        customer: Joi.string().required().custom(objectId),
        phone: Joi.string().optional(),
        meals: Joi.array().items(
            Joi.object({
                meal: Joi.string().required().custom(objectId),
                quantity: Joi.number().integer().min(1).required(),
                vendorId: Joi.string().required().custom(objectId),
            })
        ).min(1).required(),
        instructions: Joi.array().items(Joi.string()).optional(),  
        order_units: Joi.number().integer().allow(null).optional(),
        delivery_location: Joi.object({
            street1: Joi.string().required(),
            street2: Joi.string().allow("").optional(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zip: Joi.string().optional(), 
        }).required(),
        status: Joi.string().valid("pending", "active", "completed", "disputed").optional(),
        mealPlan: Joi.string().allow("").optional(),
    }),
};

const createOrderApp = {
    body: Joi.object().keys({    
        phone: Joi.string().allow("").optional(),
        meals: Joi.array()
            .items(
                Joi.object({
                    meal: Joi.string().required().custom(objectId),
                    quantity: Joi.number().integer().min(1).required(),
                    vendorId: Joi.string().required().custom(objectId),
                })
            )
            .min(1)
            .required(),
        instructions: Joi.array().items(
          Joi.alternatives().try(
            Joi.string().allow(""),
            Joi.boolean().valid(false)
          )
        ).optional(), 
        delivery_location: Joi.object({
            street1: Joi.string().required(),
            street2: Joi.string().allow("").optional(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zip: Joi.string().allow("").optional(), 
        }).required(), 
        mealPlan: Joi.string().allow("").optional(),
    }),
};

const vendorMealsStats = {
    params: Joi.object().keys({
        vendorId: Joi.string().required().custom(objectId),
        status: Joi.string().valid("all", "pending", "active", "completed", "disputed").required(),
    }),
};

const getOrders = {  
    query: Joi.object().keys({
        name: Joi.string().allow("").optional(), 
    }),
};

const getOrderById = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};
 
const updateOrderStatusById = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

const updateOrder = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({  
        customer: Joi.string().required().custom(objectId),
        phone: Joi.string().allow("").optional(),
        meals: Joi.array()
            .items(
                Joi.object({
                    meal: Joi.string().required().custom(objectId),
                    quantity: Joi.number().integer().min(1).required(),
                    vendorId: Joi.string().required().custom(objectId),
                })
            )
            .min(1)
            .required(),
        instructions: Joi.array().items(
          Joi.alternatives().try(
            Joi.string().allow(""),
            Joi.boolean().valid(false)
          )
        ).optional(), 
        order_units: Joi.number().integer().allow(null).optional(),
        delivery_location: Joi.object({
            street1: Joi.string().required(),
            street2: Joi.string().allow("").optional(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zip: Joi.string().allow("").optional(), 
        }).required(),
        status: Joi.string().valid("pending", "active", "on the way", "completed", "disputed", "canceled").optional(),
        mealPlan: Joi.string().default("").optional(),
    }),
};

const deleteOrder = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

const bulkStatusUpdate = {
    body: Joi.object().keys({  
      ids: Joi.array()
        .items(Joi.string().required().custom(objectId))
        .min(1)
        .required(),
      status: Joi.string()
        .valid("pending", "active", "on the way", "completed", "disputed", "canceled")
        .required(),
    }),
};
  

module.exports = {
    createOrderAdmin,
    createOrderApp,
    vendorMealsStats,
    getOrders, 
    getOrderById, 
    updateOrderStatusById,
    updateOrder,
    deleteOrder,
    bulkStatusUpdate
};