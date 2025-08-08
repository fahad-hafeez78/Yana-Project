const Joi = require('joi');
const { password, objectId } = require('./custom.validation'); 

const createTicket = {
    body: Joi.object().keys({
        image: Joi.string().allow('').optional(),
        title: Joi.string().trim().required(),
        category: Joi.string().valid('delivery issue', 'food quality', 'missing item', 'wrong order', 'other').required(), 
        description: Joi.string().required()   
    }),
};

const allTickets = {  
    query: Joi.object().keys({
        status: Joi.string().valid('all', 'pending', 'inprogress', 'solved').required().messages({
            'any.required': 'Status is required in query.',
            'any.only': 'Status must be either "open" or "solved".'
        }), 
    }),
};

const getTicket = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};
  
const updateTicket = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({  
        assignTo: Joi.string().custom(objectId).optional(),
        status: Joi.string().valid('pending', 'inprogress', 'solved').optional(), 
    }).min(1),
};
  
const deleteTicket = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    createTicket,
    allTickets, 
    getTicket,
    updateTicket,
    deleteTicket
};