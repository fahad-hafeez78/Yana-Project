const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTask = {
    body: Joi.object().keys({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().allow(''), 
        status: Joi.string().valid('pending', 'inprogress', 'completed').required(),
        assignTo: Joi.string().custom(objectId), 
    }),
};

const allTasks = {
    body: Joi.object().keys({
        // createdByMe: Joi.boolean().valid(true, false).default(false),
        status: Joi.string().valid('all', 'pending', 'inprogress', 'completed').required(),
    }),
};

const getTask = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
};
  
const updateTask = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        image: Joi.string(),
        title: Joi.string().trim(),
        description: Joi.string().trim().allow(''), 
        assignTo: Joi.string().custom(objectId),
        status: Joi.string().valid('pending', 'inprogress', 'completed'),
    }).min(1),
};

const deleteTask = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createTask,
    allTasks,
    getTask,  
    updateTask,
    deleteTask,
};