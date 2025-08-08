const { status } = require('http-status');
const bcrypt = require('bcryptjs');  
const tokenService = require('./token.service');
const userService = require('./user.service');
const { Token, User, Customer, Admin, Rider } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { sendPasswordResetOTPEmail, sendPasswordResetConfirmationEmail, sendSMS, sendPasswordResetOTPEmailForRider } = require("../utils/helper")
const moment = require('moment-timezone');
const { password } = require('../validations/custom.validation');

 
const loginUserWithUsernameAndPassword = async (username, password, platform, fcmtoken) => {
  const user = await userService.getUserByUsername(username);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect username or password');
  }
  const userAdmin = await userService.getUserById(user.id);

  // Prevent logging into wrong app
  if (platform === "admin" && (userAdmin.role.name == "rider" || userAdmin.role.name == "customer")) {
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect username or password');
  }
  if (platform === "customer" && userAdmin.role.name !== "customer") {
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect username or password');
  }
  if (platform === "rider" && userAdmin.role.name !== "rider") {
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect username or password');
  }

  // If account is not approved
  if (userAdmin.admin_user && userAdmin.admin_user.status !== "active") {
    throw new ApiError(status.FORBIDDEN, 'Account not approved');
  }

  if (userAdmin.rider && userAdmin.rider.status !== "active") {
    throw new ApiError(status.FORBIDDEN, 'Account not approved');
  }

  if (userAdmin.admin_user && fcmtoken) {
    await Admin.findByIdAndUpdate(userAdmin.admin_user._id, {$set: {fcm: fcmtoken}}, { new: true });
  }

  if (userAdmin.role.name && userAdmin.role.name == "customer" && fcmtoken) { 
    await Customer.findByIdAndUpdate(userAdmin.customer._id, {$set: {fcm: fcmtoken}}, { new: true });
    userAdmin.role = userAdmin.role.name;
  }

  if (userAdmin.role.name && userAdmin.role.name == "rider" && fcmtoken) { 
    await Rider.findByIdAndUpdate(userAdmin.rider._id, {$set: {fcm: fcmtoken}}, { new: true });
    userAdmin.role = userAdmin.role.name;
  }

  return userAdmin;
};
 
const logout = async (currentUser) => {
  const deleteToken = await Token.deleteMany({ user: currentUser._id, type: tokenTypes.REFRESH });
  if (!deleteToken) {
    throw new ApiError(status.NOT_FOUND, 'Token Not found');
  }

  if (currentUser.admin_user) {
    await Admin.findByIdAndUpdate(currentUser.admin_user._id, {$set: {fcm: ''}}, { new: true });
  }

  if (currentUser.role.name && currentUser.role.name == "customer") { 
    await Customer.findByIdAndUpdate(currentUser.customer._id, {$set: {fcm: ''}}, { new: true });
  }

  if (currentUser.role.name && currentUser.role.name == "rider") { 
    await Rider.findByIdAndUpdate(currentUser.rider._id, {$set: {fcm: ''}}, { new: true });
  }

  return;
};
 
const refreshAuth = async (currentUser) => {
  try {
    const latestToken = await Token.findOne({ user: currentUser._id, type: tokenTypes.REFRESH })
      .sort({ createdAt: -1 });
    if (!latestToken) {
      throw new ApiError(status.NOT_FOUND, 'Token not found');
    } 
    const refreshTokenDoc = await tokenService.verifyToken(latestToken.token, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.findOneAndDelete({ token: latestToken.token, type: tokenTypes.REFRESH });
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(status.UNAUTHORIZED, 'Please authenticate');
  }
};

const changePassword = async (currentUser, body) => {
  const user = await User.findById(currentUser._id);
  if (!user) {
    throw new ApiError(status.NOT_FOUND, 'user not found');
  }
  if (!(await user.isPasswordMatch(body.oldPassword))) {
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect old password');
  }
   
  user.password = body.newPassword;
  await user.save();
 
  return user;
};
 
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }
    let passwordToSave = await bcrypt.hash(newPassword, 8); 
    await userService.updateUserById(user._id, {password: passwordToSave});
    await Token.deleteMany({ user: user._id, type: tokenTypes.RESET_PASSWORD });
    if(user.role.name !== "customer" && user.role.name !== "rider") {
      await sendPasswordResetConfirmationEmail(user.email, user.username);
    }
    return;
  } catch (error) {
    if(error.name == "TokenExpiredError"){
      throw new ApiError(status.BAD_REQUEST, 'Reset password token expired');
    } else {
      throw new ApiError(status.UNAUTHORIZED, 'Password reset failed');
    }
  }
};
 
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(status.UNAUTHORIZED, 'Email verification failed');
  }
};

const forgotPassword = async (body) => {
  const { email, type, phone } = body;
  if(email && type == "rider") {
    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found with this email');
    }
    
    const rider = await Rider.findOne({ user: user._id })
      .populate('user', 'username email') 
      .exec();
    if (!rider) {
      throw new ApiError(status.NOT_FOUND, 'No rider details found for this user');
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    
    const otpExpiry = moment().tz('America/New_York').add(10, 'minutes').toDate();
    
    const updatedRider = await Rider.findOneAndUpdate(
      { _id: rider._id },
      { otp: otp.toString(), otpExpiry: otpExpiry },
      { new: true }
    );
    
    await sendPasswordResetOTPEmailForRider(email, rider.name, otp);

    return { success: true, message: "OTP sent on your email" };
  } else if(email && !type) {
    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found with this email');
    }
    
    const admin_user = await Admin.findOne({ user: user._id })
      .populate('user', 'username email') 
      .exec();
    if (!admin_user) {
      throw new ApiError(status.NOT_FOUND, 'No admin details found for this user');
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    
    const otpExpiry = moment().tz('America/New_York').add(10, 'minutes').toDate();
    
    const updatedAdmin = await Admin.findOneAndUpdate(
      { _id: admin_user._id },
      { otp: otp.toString(), otpExpiry: otpExpiry },
      { new: true }
    );
    
    await sendPasswordResetOTPEmail(email, admin_user.name, otp);

    return { success: true, message: "OTP sent on your email" };
  } else if(phone) {
    const customer = await Customer.findOne({ phone });
    if (!customer) {
      throw new ApiError(status.NOT_FOUND, 'No participant found with this phone');
    }
    const user = await User.findOne({ _id: customer.user }).populate("role");
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found with this phone');
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    
    const otpExpiry = moment().tz('America/New_York').add(10, 'minutes').toDate();
    
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: customer._id },
      { otp: otp.toString(), otpExpiry: otpExpiry },
      { new: true }
    );

    const messageBody = {
      to: customer.phone,
      message: `${otp} is your OTP for password reset from Yana App. It is valid for 10 minutes.`,
    };

    await sendSMS(messageBody);

    return { success: true, message: "You will receive OTP on your phone number" };
  } else {
    throw new ApiError(status.BAD_REQUEST, 'Please provide either email or phone');
  }
};

const verifyOtp = async (body) => {
  const { email, type, phone, otp } = body;
  if(email && type == "rider") {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'No User found with this email');
    }

    const rider = await Rider.findOne({ user: user._id });
    if (!rider) {
      throw new ApiError(status.NOT_FOUND, 'No rider user found with this email');
    }
    if (!rider.otp || !rider.otpExpiry) {
      throw new ApiError(status.BAD_REQUEST, 'OTP not requested or already verified');
    }
    const now = moment().tz('America/New_York').toDate();
    if (now > rider.otpExpiry) {
      throw new ApiError(status.BAD_REQUEST, 'OTP has expired');
    }
    if (rider.otp !== otp) {
      throw new ApiError(status.UNAUTHORIZED, 'Invalid OTP');
    }
    
    rider.otp = null;
    rider.otpExpiry = null;
    await rider.save();
    
    const resetToken = await tokenService.generateResetPasswordToken(user.username);
    return resetToken;
  } else if(email && !type) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'No User found with this email');
    }

    const admin = await Admin.findOne({ user: user._id });
    if (!admin) {
      throw new ApiError(status.NOT_FOUND, 'No admin user found with this email');
    }
    if (!admin.otp || !admin.otpExpiry) {
      throw new ApiError(status.BAD_REQUEST, 'OTP not requested or already verified');
    }
    const now = moment().tz('America/New_York').toDate();
    if (now > admin.otpExpiry) {
      throw new ApiError(status.BAD_REQUEST, 'OTP has expired');
    }
    if (admin.otp !== otp) {
      throw new ApiError(status.UNAUTHORIZED, 'Invalid OTP');
    }
    
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();
    
    const resetToken = await tokenService.generateResetPasswordToken(user.username);
    return resetToken;
  } else if(phone) {
    const customer = await Customer.findOne({ phone });
    if (!customer) {
      throw new ApiError(status.NOT_FOUND, 'No participant found with this phone');
    }
    const user = await User.findOne({ _id: customer.user }).populate("role");
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found with this phone');
    }

    if (!customer.otp || !customer.otpExpiry) {
      throw new ApiError(status.BAD_REQUEST, 'OTP not requested or already verified');
    }
    const now = moment().tz('America/New_York').toDate();
    if (now > customer.otpExpiry) {
      throw new ApiError(status.BAD_REQUEST, 'OTP has expired');
    }
    if (customer.otp !== otp) {
      throw new ApiError(status.UNAUTHORIZED, 'Invalid OTP');
    } 
    customer.otp = null;
    customer.otpExpiry = null;
    await customer.save();
    
    const resetToken = await tokenService.generateResetPasswordToken(user.username);
    return resetToken; 
  } else {
    throw new ApiError(status.BAD_REQUEST, 'Please provide either email or phone');
  }
};

module.exports = {
  loginUserWithUsernameAndPassword,
  logout,
  refreshAuth,
  changePassword,
  resetPassword,
  verifyEmail,
  forgotPassword,
  verifyOtp,
};
