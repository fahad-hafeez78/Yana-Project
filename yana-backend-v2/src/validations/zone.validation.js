const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createZone = {
    body: Joi.object().keys({ 
        name: Joi.string().max(50).required(), 
    }),
};
  
const getZone = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
};
  
const updateZone = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({ 
        name: Joi.string().max(50).required(), 
    }).min(1),
};
  
const deleteZone = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createZone, 
    getZone,
    updateZone,
    deleteZone
};