const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createClaim = {
  body: Joi.object({
    customer: Joi.string().custom(objectId).required(),
    order: Joi.string().custom(objectId).required(),
    claim_num: Joi.string().required(),
    insurance: Joi.string(),
    created_date: Joi.date(), 
    from_dos: Joi.date().allow(null),
    to_dos: Joi.date().allow(null), 
    facility: Joi.string().allow('', null),
    status: Joi.string().valid('in_process', 'denied', 'paid', 'partially_paid', 'billed'),
    cpt: Joi.string().allow('', null), 
    unit_price: Joi.number().allow(null),
    units: Joi.number().allow(null),
    days: Joi.number().allow(null),
    billed_amount: Joi.number().allow(null),
    allowed_amount: Joi.number().allow(null),
    paid_amount: Joi.number().allow(null),
    payment_date: Joi.date().allow(null),
    check: Joi.string().allow('', null),
    comment: Joi.string().allow('', null),
  })
};

const getAllClaims = {
  query: Joi.object().keys({
    status: Joi.string().valid("in_process", "denied", "paid", "partially_paid", "billed", "all").default("all"), 
  }),
};

const getClaimsStatistics = {
  query: Joi.object({
    period: Joi.string().valid('month', 'year').required(),

    // If period = 'month', require both `month` and `year`
    month: Joi.when('period', {
      is: 'month',
      then: Joi.string()
        .valid(
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        )
        .required(),
      otherwise: Joi.forbidden()
    }),

    // Year is required for both periods
    year: Joi.string()
      .regex(/^\d{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'Year must be a 4-digit number'
      }),
  }),
};

const updateClaim = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object({
        customer: Joi.string().custom(objectId).required(),
        order: Joi.string().custom(objectId).required(),
        claim_num: Joi.string(),
        insurance: Joi.string(),
        created_date: Joi.date(), 
        from_dos: Joi.date().allow(null),
        to_dos: Joi.date().allow(null), 
        facility: Joi.string().allow('', null),
        status: Joi.string().valid('in_process', 'denied', 'paid', 'partially_paid', 'billed'),
        cpt: Joi.string().allow('', null), 
        unit_price: Joi.number().allow(null),
        units: Joi.number().allow(null),
        days: Joi.number().allow(null),
        billed_amount: Joi.number().allow(null),
        allowed_amount: Joi.number().allow(null),
        paid_amount: Joi.number().allow(null),
        payment_date: Joi.date().allow(null),
        check: Joi.string().allow('', null),
        comment: Joi.string().allow('', null),
    })
};

const singleClaim = {
  params: Joi.object({
    id: Joi.string().custom(objectId).required(),
  })
};

module.exports = {
  createClaim,
  getAllClaims,
  getClaimsStatistics,
  updateClaim,
  singleClaim
};