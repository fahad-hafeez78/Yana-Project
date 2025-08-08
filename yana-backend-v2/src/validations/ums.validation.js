const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const { default: status } = require('http-status');
const { query } = require('express');

const createAdminUser = {
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
    kitchen_address: Joi.alternatives().try(
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

const allAdminUsers = {
  query: Joi.object().keys({
    status: Joi.string().valid('all', 'active', 'inactive').default("all"), 
  }),
}
 
const usersByRoleId = {
  query: Joi.object().keys({
    roleId: Joi.string().required().custom(objectId),
    type: Joi.string().valid("chat", "task", "ticket", "").required(), 
  }),
}
const getAdminUser = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),
    }),
};
  
const updateAdminUser = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({ 
      email: Joi.string().email(),  
      name: Joi.string().trim(),
      phone: Joi.string(), 
      photo: Joi.string().allow("").optional(), 
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
      kitchen_address: Joi.alternatives().try(
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
      timezone: Joi.string().optional(),
      gender: Joi.string().valid("male", "female", "other"),  
      w9path: Joi.string().allow("").optional(), 
    }).min(1),
};

const updateStatusByAdmin = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({  
    status: Joi.string().valid('active', 'inactive').required()
  }),
};
  
const deleteAdminUser = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
  createAdminUser, 
  allAdminUsers,
  usersByRoleId,
  getAdminUser,
  updateAdminUser,
  updateStatusByAdmin,
  deleteAdminUser
};