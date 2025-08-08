const express = require('express');
const validate = require('../../middlewares/validate');
const { authValidation } = require('../../validations');
const { authController } = require('../../controllers');
const { auth, isAny_Admin } = require('../../middlewares/auth');
 
const router = express.Router();
 
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', auth, authController.logout);
router.post('/refresh-tokens', auth, authController.refreshTokens);
router.post('/change-password', auth, validate(authValidation.changePassword), authController.changePassword);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/verify-otp', validate(authValidation.verifyOtp), authController.verifyOtp);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
// router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
// router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

module.exports = router;