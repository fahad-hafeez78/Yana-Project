const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createMeal = {
    body: Joi.object().keys({  
        vendorId: Joi.string().required().custom(objectId), 
        name: Joi.string().required(),
        category: Joi.string().valid("breakfast", "lunch", "dinner").required(),
        price: Joi.number().optional(),
        description: Joi.string().max(255).allow("").optional(),
        tags: Joi.alternatives().try(
            Joi.array().items(Joi.string()), 
            Joi.string().custom((value, helpers) => {
              try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                  return helpers.error('any.invalid');
                }
                return parsed;
              } catch (e) {
                return helpers.error('any.invalid');
              }
            }, 'Stringified Array Validation')
        ).default([]),
        ingredients: Joi.alternatives().try(
          Joi.array().items(Joi.string()), 
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid');
              }
              return parsed;
            } catch (e) {
              return helpers.error('any.invalid');
            }
          }, 'Stringified Array Validation')
        ).default([]), 
        nutrition_info: Joi.alternatives().try(
          Joi.array().items(Joi.string()), 
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid');
              }
              return parsed;
            } catch (e) {
              return helpers.error('any.invalid');
            }
          }, 'Stringified Array Validation')
        ).default([]),
        allergies: Joi.alternatives().try(
          Joi.array().items(Joi.string()), 
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid');
              }
              return parsed;
            } catch (e) {
              return helpers.error('any.invalid');
            }
          }, 'Stringified Array Validation')
        ).default([]), 
        status: Joi.string().valid("active", "inactive").default("active")
    }),
};

const filterMeals = {  
    body: Joi.object().keys({
      category: Joi.string().valid("breakfast", "lunch", "dinner").required(),
      tags: Joi.array().items(Joi.string())
    }),
};

const vendorMeals = {
  params: Joi.object().keys({
    vendorId: Joi.string().required().custom(objectId),
  }),
}

const customerMeals = {  
  body: Joi.object().keys({
    category: Joi.string().valid("Breakfast", "Lunch", "Dinner", "All").optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),
};

const getSingleMeal = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),
    }),
};

 
const updateMeal = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({   
        vendorId: Joi.string().custom(objectId),
        image: Joi.string(),
        name: Joi.string().trim(),
        category: Joi.string().valid("breakfast", "lunch", "dinner").optional(),
        price: Joi.number().optional(),
        description: Joi.string().max(255).allow("").optional(),
        tags: Joi.alternatives().try(
            Joi.array().items(Joi.string()), 
            Joi.string().custom((value, helpers) => {
              try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                  return helpers.error('any.invalid');
                }
                return parsed;
              } catch (e) {
                return helpers.error('any.invalid');
              }
            }, 'Stringified Array Validation')
        ),
        ingredients: Joi.alternatives().try(
          Joi.array().items(Joi.string()), 
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid');
              }
              return parsed;
            } catch (e) {
              return helpers.error('any.invalid');
            }
          }, 'Stringified Array Validation')
        ), 
        nutrition_info: Joi.alternatives().try(
          Joi.array().items(Joi.string()), 
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid');
              }
              return parsed;
            } catch (e) {
              return helpers.error('any.invalid');
            }
          }, 'Stringified Array Validation')
        ),
        allergies: Joi.alternatives().try(
          Joi.array().items(Joi.string()), 
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid');
              }
              return parsed;
            } catch (e) {
              return helpers.error('any.invalid');
            }
          }, 'Stringified Array Validation')
        ),
        status: Joi.string().valid("active", "inactive").optional()
    }).min(1),
};
  
const deleteMeal = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),
    }),
};

const toggleFavorite = {
  body: Joi.object().keys({ 
      mealId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
    createMeal,
    filterMeals, 
    vendorMeals,
    customerMeals,
    getSingleMeal,
    updateMeal,
    deleteMeal,
    toggleFavorite
};