const { status } = require('http-status'); 
const { User, Admin, Customer, Rider } = require('../models');
const ApiError = require('../utils/ApiError'); 

 
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

const getUserById = async (id) => {
  let user = await User.findById(id).select("-password").populate("createdBy", "username email").populate("role").populate("organization").lean();
  if (!user) {
    throw new ApiError(status.NOT_FOUND, 'User not found');
  }
  if(user.role.name === "customer"){
    user.customer = await Customer.findOne({user: user._id}).select("-otp").populate("coordinator").populate("insurance").lean();
    return user;
  } else if(user.role.name === "rider"){
    user.rider = await Rider.findOne({user: user._id}).select("-otp").lean();
    return user;
  } else {
    user.admin_user = await Admin.findOne({user: user._id}).select("-otp").lean();
    return user;
  }
};
 
const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const getAdminByUserId = async (userId) => {
  return await Admin.findOne({ user: userId })
  .populate({
    path: "user",
    select: "username email role",
    populate: {
      path: "role",
      select: "role permissions"
    }
  });
};

const getUserByUsername = async (username) => {
  return await User.findOne({ username });
};
 
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(status.NOT_FOUND, 'User not found');
  } 
  
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateBody },
    { new: true, runValidators: true }  
  ); 

  return updatedUser;
};
 
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(status.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

module.exports = { 
  queryUsers,
  getUserById,
  getUserByEmail,
  getAdminByUserId,
  getUserByUsername,
  updateUserById,
  deleteUserById,
};
