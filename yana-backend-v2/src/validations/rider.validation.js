const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
 
const createRider = {
  body: Joi.object().keys({ 
    email: Joi.string().required().email(),  
    vendorId: Joi.string().custom(objectId).required(),
    // zone: Joi.string().custom(objectId).required(),
    vehicle_no: Joi.string().trim().required(),
    vehicle_model: Joi.string().allow("").optional(),  
    name: Joi.string().trim().required(),
    phone: Joi.string().required(),  
    address: Joi.alternatives().try(
      Joi.object().keys({
        street1: Joi.string().allow("").optional(),
        street2: Joi.string().allow("").optional(),
        city: Joi.string().allow("").optional(),
        state: Joi.string().allow("").optional(),
        zip: Joi.string().allow("").optional(),  
      }),
      Joi.string().custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed !== "object" || Array.isArray(parsed)) {
            return helpers.error('any.invalid');
          }
          return parsed;
        } catch (e) {
          return helpers.error('any.invalid');
        }
      }, 'Stringified Object Validation')
    ).optional(),
    rating: Joi.number().min(0).max(10).optional(),
    timezone: Joi.string().allow("").optional(),
    gender: Joi.string().valid("male", "female", "other").required(), 
    otp: Joi.string().length(6).pattern(/^\d{6}$/).optional(),
  }),
};

const getRider = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};
  
const updateRider = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({ 
        // zone: Joi.string().custom(objectId).optional(),
        vendorId: Joi.string().custom(objectId).required(),
        email: Joi.string().email(),  
        name: Joi.string().trim(),
        phone: Joi.string().trim(), 
        status: Joi.string().valid('active', 'inactive').optional(),  
        photo: Joi.string().allow("").optional(),
        gender: Joi.string().valid("male", "female", "other").required(), 
        vehicle_no: Joi.string().trim(),
        vehicle_model: Joi.string().allow("").optional(), 
        address: Joi.alternatives().try(
            Joi.object().keys({
            street1: Joi.string().allow("").optional(),
            street2: Joi.string().allow("").optional(),
            city: Joi.string().allow("").optional(),
            state: Joi.string().allow("").optional(),
            zip: Joi.string().allow("").optional(),  
            }),
            Joi.string().custom((value, helpers) => {
            try {
                const parsed = JSON.parse(value);
                if (typeof parsed !== "object" || Array.isArray(parsed)) {
                return helpers.error('any.invalid');
                }
                return parsed;
            } catch (e) {
                return helpers.error('any.invalid');
            }
            }, 'Stringified Object Validation')
        ).optional(),
    }).min(1),
};
  
const deleteRider = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

module.exports = {   
    createRider,
    getRider,
    updateRider,
    deleteRider
};