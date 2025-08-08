const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, emailService } = require('../services');
 

const login = catchAsync(async (req, res) => {
  const { username, password, fcmtoken, platform } = req.body;
  const user = await authService.loginUserWithUsernameAndPassword(username, password, platform, fcmtoken);
  const tokens = await tokenService.generateAuthTokens(user);
  // res.header('X-Refresh-Token', tokens.refresh_token); 
  res.send({ success: true, message: "Login Success", user: user, token: tokens.access_token });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user);
  res.status(status.OK).send({ success: true, message: "Logout Success" });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.user);
  // res.header('X-Refresh-Token', tokens.refresh_token);
  res.send({ token: tokens.access_token });
});

const changePassword = catchAsync(async (req, res) => { 
  const user = await authService.changePassword(req.user, req.body); 
  res.send({ success: true, message: "Password changed successfully" });
});

const forgotPassword = catchAsync(async (req, res) => {
  const response = await authService.forgotPassword(req.body);
  res.send(response);
});

const verifyOtp = catchAsync(async (req, res) => {
  const resetToken = await authService.verifyOtp(req.body);
  res.send({ success: true, message: "OTP Verified Successfully.", resetToken: resetToken }); 
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.resetToken, req.body.password);
  res.send({ success: true, message: "Password Reset Successfully." });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(status.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(status.NO_CONTENT).send();
});

module.exports = { 
  login,
  logout,
  refreshTokens,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
