const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

  
const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    fcmtoken: Joi.string().optional(),
    platform: Joi.string().valid("admin", "customer", "rider").required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().allow("").optional(),
    type: Joi.string().valid("rider").optional(),
    phone: Joi.string().allow("").optional()
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().optional(),
    type: Joi.string().valid("rider").optional(),
    phone: Joi.string().optional(),
    otp: Joi.string().required(),
  }),
};

const resetPassword = { 
  body: Joi.object().keys({
    resetToken: Joi.string().required(),
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = { 
  login,
  logout,
  refreshTokens,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyOtp,
};
