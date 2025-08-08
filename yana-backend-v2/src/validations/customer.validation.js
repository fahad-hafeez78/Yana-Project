const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createCustomer = {
    body: Joi.object().keys({ 
        coordinator: Joi.object({
            name: Joi.string().allow("", null).optional(),
            email: Joi.string().allow("", null).optional().email(),
            phone: Joi.string().allow("", null).optional(),
        }).required(),
        insurance: Joi.object({
            mcpt: Joi.string().allow("").optional(),
            m_auth_units_approved: Joi.string().allow("").optional(),
            m_frequency: Joi.string().allow("").optional(),
            pcpt: Joi.string().allow("").optional(),
            p_auth_units_approved: Joi.string().allow("").optional(),
            p_frequency: Joi.string().allow("").optional(),
            note: Joi.string().allow("").optional(),
        }).required(),
        memberId: Joi.string().required(),
        medicaidId: Joi.string().required(),
        name: Joi.string().trim().required().messages({
            'string.empty': 'Participant name is required',
            'any.required': 'Participant name is required',
        }),
        phone: Joi.string().max(20).optional(),
        photo: Joi.string().optional(),
        insuranceCardPhoto: Joi.string().optional(),
        address: Joi.object({
            street1: Joi.string().allow("").optional(),
            street2: Joi.string().allow("").optional(),
            city: Joi.string().allow("").optional(),
            state: Joi.string().allow("").optional(),
            zip: Joi.string().allow("").optional(), 
        }).optional(),
        alternate_contact: Joi.object({
            name: Joi.string().allow("").optional(),
            phone: Joi.string().allow("").optional(),
            relation: Joi.string().allow("").optional(),
            address: Joi.object({
                street1: Joi.string().allow("").optional(),
                street2: Joi.string().allow("").optional(),
                city: Joi.string().allow("").optional(),
                state: Joi.string().allow("").optional(),
                zip: Joi.string().allow("").optional(), 
            }).allow({}).optional(),
        }).allow({}).optional(),
        gender: Joi.string().valid("male", "female", "other").optional(),
        allergies: Joi.alternatives().try(Joi.array().items(Joi.string().allow('')).optional()),
        dob: Joi.string().optional(),
        io_type: Joi.string().optional(),
        auth_number_facets: Joi.string().optional(),
        start_date: Joi.date().allow("", null).optional(),
        end_date: Joi.date().allow("", null).optional(),
        icd10code: Joi.string().optional(),
        status: Joi.string().valid("active", "inactive", "approved", "pending").default("inactive"),
        pauseStartDt: Joi.date().allow(null).optional(),
        pauseEndDt: Joi.date().allow(null).optional(),
        otp: Joi.string().length(6).default("000000"),
        vendorId: Joi.string().optional().custom(objectId),
        // zone: Joi.string().required().custom(objectId),
    }),
};

const getCustomers = {  
    query: Joi.object().keys({
        status: Joi.string().valid("active", "inactive", "approved", "pending", "all").default("all"), 
    }),
};

const getPersCustomers = {  
    query: Joi.object().keys({
        pers_status: Joi.string().valid('all', 'active', 'inactive', 'empty', 'unassigned').default("all"), 
    }),
};

const getCustomer = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

const generateCredential = {
    body: Joi.object().keys({
        customerId: Joi.string().required().custom(objectId),
    }),
};

const updateCustomer = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({  
        coordinator: Joi.object({
            name: Joi.string().allow("", null).optional(),
            email: Joi.string().allow("", null).optional().email().message("coordinator email is Invalid"),
            phone: Joi.string().allow("", null).optional(),
        }),
        insurance: Joi.object({
            mcpt: Joi.string().allow("").optional(),
            m_auth_units_approved: Joi.string().allow("").optional(),
            m_frequency: Joi.string().allow("").optional(),
            pcpt: Joi.string().allow("").optional(),
            p_auth_units_approved: Joi.string().allow("").optional(),
            p_frequency: Joi.string().allow("").optional(),
            note: Joi.string().allow("").optional(),
        }),
        memberId: Joi.string(),
        medicaidId: Joi.string(),
        name: Joi.string().trim(),
        phone: Joi.string().max(45),
        photo: Joi.string(),
        insuranceCardPhoto: Joi.string(),
        address: Joi.object({
            street1: Joi.string().required(),
            street2: Joi.string().allow("").optional(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zip: Joi.string().required(), 
        }),
        alternate_contact: Joi.object({
            name: Joi.string().allow("").optional(),
            phone: Joi.string().allow("").optional(),
            relation: Joi.string().allow("").optional(),
            address: Joi.object({
                street1: Joi.string().allow("").optional(),
                street2: Joi.string().allow("").optional(),
                city: Joi.string().allow("").optional(),
                state: Joi.string().allow("").optional(),
                zip: Joi.string().allow("").optional(), 
            }).allow({}).optional(),
        }).allow({}).optional(),
        gender: Joi.string().valid("male", "female", "other"),
        allergies: Joi.alternatives().try(Joi.array().items(Joi.string().allow('')).optional()),
        dob: Joi.string(),
        io_type: Joi.string(),
        auth_number_facets: Joi.string(),
        start_date: Joi.date().allow(null, '').optional(),
        end_date: Joi.date().allow(null, '').optional(),
        icd10code: Joi.string(),
        status: Joi.string().valid("active", "inactive", "approved", "pending"),
        pers_status: Joi.string().valid("active", "inactive", "empty", "unassigned").optional(),
        pauseStartDt: Joi.date().allow(null),
        pauseEndDt: Joi.date().allow(null), 
        vendorId: Joi.string().custom(objectId),
        // zone: Joi.string().custom(objectId),
    }).min(1),
};
  
const deleteCustomer = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

const applyCustomerChanges = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};
 
const createRequest = {
    body: Joi.object().keys({
        type: Joi.string().valid("delete", "status", "pause").required(),
        request: Joi.string().trim().required(),
        pauseStartDt: Joi.date().optional(),
        pauseEndDt: Joi.date().optional(),
    }),
}

const getAllRequests = {
    query: Joi.object().keys({
        status: Joi.string().valid('all', 'pending', 'approved', 'rejected').default("all"), 
    }),
}

const requestAction = {
    body: Joi.object().keys({
        requestId: Joi.string().required().custom(objectId),
        action: Joi.string().trim().required(),
    }),
}
  
const bulkStatusUpdate = {
    body: Joi.object().keys({
        ids: Joi.array()
            .items(Joi.string().required().custom(objectId))
            .min(1)
            .required(),
        status: Joi.string()
            .valid('active', 'inactive', 'approved', 'pending')
            .required(),
    }),
};

const updateCustomerStatus = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({
        status: Joi.string()
            .valid("active", "inactive", "approved", "pending")
            .required()
    }),
};
 

module.exports = {
    createCustomer,
    getCustomers, 
    getPersCustomers,
    getCustomer,
    generateCredential,
    updateCustomer,
    deleteCustomer,
    applyCustomerChanges, 
    createRequest,
    getAllRequests,
    requestAction, 
    updateCustomerStatus,
    bulkStatusUpdate
};