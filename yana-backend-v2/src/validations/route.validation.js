const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
 

const createAndAssigneRoutes = {
    params: Joi.object().keys({
        vendorId: Joi.string().required().custom(objectId),
    }),
};

const getRoutes = {  
    body: Joi.object().keys({
        status: Joi.string().valid('all', 'pending', 'assigned', 'inprogress', 'pause', 'completed').required(),
        // type: Joi.string().valid("current", "previous").required(),
        // date: Joi.date().optional(),
    }),
};

const assignZoneToOrder = {  
    body: Joi.object().keys({
        orderId: Joi.string().required().custom(objectId),
        zoneId: Joi.string().required().custom(objectId)
    }),
};

const getRoute = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};
  
const updateRoute = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({ 
        stops: Joi.array().items(
            Joi.object({
                _id: Joi.string().optional().custom(objectId),
                order: Joi.string().required().custom(objectId),
                sequence: Joi.number().integer().required(),
                location: Joi.array().items(Joi.number().min(-180).max(180)).length(2).required(),
                status: Joi.string().valid("pending", "delivered").required()
            })
        ).min(1).required(),
    })
};

const updateRouteStatus = {  
    body: Joi.object().keys({
        routeId: Joi.string().required().custom(objectId),
        status: Joi.string().valid('inprogress', 'pause', 'completed').required()
    }),
};

const updateOrderStatus = {
    body: Joi.object().keys({
        routeId: Joi.string().required().custom(objectId),
        orderId: Joi.string().required().custom(objectId),
        status: Joi.string().valid('delivered', 'canceled').required(),
        pod: Joi.string().optional().allow('', null, 'null', 'undefined'),
    }),
};

const nextDestination = {  
    body: Joi.object().keys({
        routeId: Joi.string().required().custom(objectId),
        orderId: Joi.string().required().custom(objectId)
    }),
};
  
const deleteRoutes = {
    params: Joi.object().keys({
        vendorId: Joi.string().required().custom(objectId),
    }),
};

module.exports = { 
    createAndAssigneRoutes,
    getRoutes, 
    assignZoneToOrder,
    getRoute,
    updateRoute,
    updateRouteStatus,
    updateOrderStatus,
    nextDestination,
    deleteRoutes
};