const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createMenu = {
    body: Joi.object().keys({ 
        name: Joi.string().min(3).max(50).required().trim(),
        vendorId: Joi.string().required().custom(objectId),
        meals: Joi.alternatives().try(
            Joi.array().items(Joi.string().custom(objectId)), 
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
        ).required()
    }),
};

const vendorMenus = {
  params: Joi.object().keys({
    vendorId: Joi.string().required().custom(objectId),
  }),
}

const createOrUpdateAssignMenu = {
    body: Joi.object().keys({  
        vendorId: Joi.string().required().custom(objectId), 
        assignments: Joi.array().items(
            Joi.object({
                startDate: Joi.date().required(),
                endDate: Joi.date().required(),  //min(Joi.ref('startDate')).required(), // Ensures endDate is after startDate
                menus: Joi.array().items(Joi.string().required().custom(objectId)).min(1) // At least one menu
            })
        ).max(4).required(),
    }),
};

const fetchAssignedMenus = {
    body: Joi.object().keys({  
        vendorId: Joi.string().custom(objectId).allow("").optional()
    }),
};
 
const getSingleMenu = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};
  
const updateMenu = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({ 
        image: Joi.string(),
        name: Joi.string().min(3).max(50).trim(),
        meals: Joi.alternatives().try(
            Joi.array().items(Joi.string().custom(objectId)), 
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
    }).min(1),
};
  
const deleteMenu = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    createMenu, 
    vendorMenus,
    createOrUpdateAssignMenu,
    fetchAssignedMenus, 
    getSingleMenu,
    updateMenu,
    deleteMenu
};