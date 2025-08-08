const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createRole = {
    body: Joi.object().keys({ 
        name: Joi.string().required().trim().lowercase(),
        description: Joi.string().default(""),
        permissions: Joi.array().items(
            Joi.object({ 
                page: Joi.string().required().trim(),
                actions: Joi.array().items(
                    Joi.string().required()
                ).required()
            }).required()
        ).required(),
        parentRole: Joi.string().required().custom(objectId),
        parentUser: Joi.string().required().custom(objectId),
    }),
};

const dropDown = {
    query: Joi.object().keys({
        type: Joi.string().valid("user", "chat", "task", "ticket").required(), 
        ticket_vendor_userId: Joi.string().custom(objectId).allow(null, 'null'),
    }), 
};
 
const getRole = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};
  
const updateRole = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({ 
        name: Joi.string().required().trim().lowercase(),
        description: Joi.string().default(""),
        permissions: Joi.array().items(
            Joi.object({ 
                page: Joi.string().required().trim(),
                actions: Joi.array().items(
                    Joi.string().required()
                ).required()
            }).required()
        ).required(),
        parentRole: Joi.string().required().custom(objectId),
        parentUser: Joi.string().required().custom(objectId),
    }).min(1),
};
  
const deleteRole = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    createRole, 
    dropDown,
    getRole, 
    updateRole,
    deleteRole
};