const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
const { User, Rider, Role, Admin, Route } = require('../models'); 
const { uploadToS3, deleteFromS3 } = require('./s3Bucket.service');
const { generateUniqueUsername, generateRandomPassword, sendAccountCreationEmail, getVendorIdForUser } = require('../utils/helper');
const generateUniqueId = require('../utils/generateUnique');

const createRider = async (currentUser, file, userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(status.BAD_REQUEST, 'Email already exist');
  } 

  if (await Rider.findOne({phone: userBody.phone})) {
    throw new ApiError(status.BAD_REQUEST, 'Phone already exist');
  }

  let vendor = await Admin.findById(userBody.vendorId)
    .populate({
      path: "user",
      select: "-password",
      populate: {
          path: "role",
          select: "name description permissions"
      }
    }).lean();

  if (!vendor) throw new ApiError(status.NOT_FOUND, 'vendor not found');
  if (vendor.user.role.name !== 'vendor') throw new ApiError(status.NOT_FOUND, 'this is not vendor Id');  

  let role = await Role.findOne({name: "rider"});
  if(!role){
    throw new ApiError(status.NOT_FOUND, 'rider role not found');
  }
   
  userBody.status = "inactive";
  if (currentUser.role.name == 'admin') {
    userBody.status = "active";
  }
 
  let username = await generateUniqueUsername(userBody.email);
  let password = await generateRandomPassword();
  let saveUser = {  
    username: username,
    email: userBody.email,
    password: password,
    role: role._id,
    hierarchyLevel: role.hierarchyLevel,
  };
  let user = await User.create(saveUser);

  if(file){  
    const imageUrl = await uploadToS3(file, "rider");
    userBody.photo = imageUrl;
  }
   
  let saveRider = {
    ...userBody,
    user: user._id,  
    rider_id: await generateUniqueId("RID")
  }; 
   
  let rider = await Rider.create(saveRider);
  
  rider = rider.toObject();
  await sendAccountCreationEmail(user.email, rider.name, user.username, password);
  console.log("Username and Password", {username: user.username, password});
  
  rider.username = user.username;
  rider.password = password;  
 
  return rider;
};
 
const getAllRiders = async (currentUser, query) => {   
  
  const { status } = query;
  if (status && !['active', 'inactive', 'all'].includes(status)) {
    throw new ApiError(status.BAD_REQUEST, 'Invalid status filter');
  }
 
  let queryFilter = {}; 
  if (status !== 'all') {
    queryFilter.status = status;
  }

  let riders = await Rider.find(queryFilter)
    .populate("user", "username email role")
    .populate("vendorId", "vendor_id name photo") 
    .sort({createdAt: -1})
    .lean();

  let vendorId = await getVendorIdForUser(currentUser);

  if (vendorId) { 
    riders = riders.filter(rider => 
      rider.vendorId._id && rider.vendorId._id.toString() === vendorId.toString() 
    );  
  }
    
  return riders; 
};

const getRiderById = async (id) => {
  let rider = await Rider.findById(id)
  .populate("user", "username email role") 
  .populate("vendorId", "vendor_id name photo")
  // .populate("zone")
  .lean();

  if (!rider) {
    throw new ApiError(status.NOT_FOUND, 'rider not found');
  }

  if (!rider.user) {
    throw new ApiError(status.NOT_FOUND, 'rider user not found');
  }
 
  return rider;  
};

const updateRiderById = async (id, file, updateBody) => {
  const rider = await getRiderById(id); 
  if (!rider) {
    throw new ApiError(status.NOT_FOUND, 'rider not found');
  }

  if(updateBody.status == 'inactive'){
    let route = await Route.findOne({rider: id, status: {$in: ['pending', 'assigned', 'inprogress', 'pause']}});
    if(route){
      throw new ApiError(status.NOT_FOUND, 'This rider can not be Inactive yet. Their assigned route in progress.');
    }
  }

  if (updateBody.email) {
    await User.findByIdAndUpdate(rider.user._id, { email: updateBody.email });
  }

  if (file) { 
    const imageKey = rider.photo?.split(`.amazonaws.com/`)[1]; // Extract key from URL
    if (imageKey) {
      await deleteFromS3(imageKey);
    }

    const imageUrl = await uploadToS3(file, "ums");
    updateBody.photo = imageUrl; 
  }

  const updatedRider = await Rider.findByIdAndUpdate(
    id,
    { $set: updateBody },
    { new: true, runValidators: true }
  );

  return await getRiderById(id);
};

const deleteRiderById = async (id) => {
    const rider = await getRiderById(id);
    if (!rider) {
      throw new ApiError(status.NOT_FOUND, 'rider not found');
    }

    let routeOfRiderExist = await Route.findOne({rider: id, status: { $in: ['pending', 'assigned', 'inprogress', 'pause'] }});
    if (routeOfRiderExist) {
      throw new ApiError(status.NOT_FOUND, 'This rider can not be Delete yet. Their assigned route in progress.');
    }
  
    await Rider.findByIdAndDelete(id);
    await User.findByIdAndDelete(rider.user._id);
  
    return;
};

const loggedInRiderDetails = async (currentUser) => { 
    let user = await User.findById(currentUser._id).select("username email createdAt updatedAt").lean();
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'user not found'); 
    }

    user.role = currentUser.role.name;

    const rider = await Rider.findOne({user: user._id}).select("-otp").lean(); 
    if (!rider) {
      throw new ApiError(status.NOT_FOUND, 'rider not found'); 
    } 
    
    // let rider_vendor = await Admin.findById(rider.vendorId)
    //   .select("user vendor_id name photo").lean();

    user.rider = rider;
    // user.rider.vendor = rider_vendor;
    return user; 
};

const updateRiderImage = async (currentUser, file) => {
  if(!currentUser || !currentUser.rider){
    throw new ApiError(status.NOT_FOUND, 'Rider not found');
  }

  if(!file){
    throw new ApiError(status.NOT_FOUND, 'Profile image not found');
  }
 
  // Delete existing photo from S3 if it exists
  if (currentUser.rider.photo) {
    const imageKey = currentUser.rider.photo.split('.amazonaws.com/')[1];
    if (imageKey) {
      await deleteFromS3(imageKey);
    }
  }

  // Upload new photo to S3
  const imageUrl = await uploadToS3(file, 'rider');
  if (!imageUrl) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, 'Failed to upload image');
  }

  // Update rider with new photo
  const updatedRider = await Rider.findByIdAndUpdate(
    currentUser.rider._id,
    { $set: { photo: imageUrl } },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedRider) {
    throw new ApiError(status.NOT_FOUND, 'Rider not found after update');
  }

  return await loggedInRiderDetails(currentUser);
};


module.exports = { 
  createRider,
  getAllRiders,
  getRiderById,
  updateRiderById,
  deleteRiderById,
  loggedInRiderDetails,
  updateRiderImage, 
};
