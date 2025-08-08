const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createVendor = {
    body: Joi.object().keys({ 
        email: Joi.string().required().email(), 
        roleId: Joi.string().required().custom(objectId),
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
        timezone: Joi.string().optional(),
        gender: Joi.string().valid("male", "female", "other").required(), 
        otp: Joi.string().length(6).pattern(/^\d{6}$/).optional(),
    }),
};
  
const getVendor = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};
  
const updateVendor = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({ 
        email: Joi.string().email(),  
        name: Joi.string().trim(),
        phone: Joi.string().trim(), 
        status: Joi.string().valid('active', 'inactive').optional(), 
        w9path: Joi.string().trim(),
        photo: Joi.string().trim(),
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
  
const deleteVendor = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    createVendor, 
    getVendor,
    updateVendor,
    deleteVendor
};