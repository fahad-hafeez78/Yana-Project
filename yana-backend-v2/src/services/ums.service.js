const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
const sharp = require('sharp');
const moment = require("moment-timezone");
const { User, Admin, Role, Rider, Organization } = require('../models');
const { generateRandomPassword, generateUniqueUsername, sendAccountCreationEmail, getCoordinatesFromAddress, getVendorIdForUser } = require('../utils/helper');
const generateUniqueId = require('../utils/generateUnique');
const { uploadToS3, deleteFromS3 } = require('./s3Bucket.service');
const { userService } = require('../services');
const { getUserById } = require('./user.service');
 
const loggedInUser = async (currentUser) => { 
  let user = await getUserById(currentUser._id); 
  return user;
};

const createAdminUser = async (currentUser, files, userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(status.BAD_REQUEST, 'Email already taken');
  }
  if (await Admin.findOne({phone: userBody.phone})) {
    throw new ApiError(status.BAD_REQUEST, 'Phone already exist');
  }
   
  let role = await Role.findById(userBody.roleId);
  if (!role) {
    throw new ApiError(status.NOT_FOUND, 'Role not found');
  }

  // Only allow user creation if currentUser is admin or parentUser of the role
  if (currentUser.role.name !== 'admin' && String(role.parentUser) !== String(currentUser._id)) {
    throw new ApiError(status.FORBIDDEN, 'You are not allowed to assign this role');
  }
  
  let userOrganization = null;  
  if (role.name == "vendor") {
    const orgName = userBody.email.split('@')[0];
    const newOrg = await Organization.create({
      name: `${orgName}-organization-${Date.now()}`
    });
        
    userOrganization = newOrg._id;

    if (currentUser.role.name !== 'admin') {
      throw new ApiError(status.FORBIDDEN, 'Only admin can create vendor users'); 
    }
    if (!files['w9path']) { 
      throw new ApiError(status.NOT_FOUND, 'w9path is required, please upload');
    }
  } else if (role.name !== "vendor") {  
    userOrganization = role.organization; 
  } else { 
    userOrganization = currentUser.organization;
  }  

  // Only super admins can create admin users
  if (role.name == 'admin' && currentUser.role.name !== 'admin') {
    throw new ApiError(status.FORBIDDEN, 'Only admins can create admin users'); 
  } 

  userBody.status = "inactive";
  if (currentUser.role.name == 'admin') {
    userBody.status = "active";
  }
  
  let username = await generateUniqueUsername(userBody.email);
  let password = await generateRandomPassword();
  let saveUser = { 
    createdBy: role.parentUser,
    username: username,
    email: userBody.email,
    password: password,
    role: role._id, 
    organization: userOrganization,
    hierarchyLevel: role.hierarchyLevel, 
  };
  let user = await User.create(saveUser);

  if (files['photo']) {  
    const compressedBuffer = await sharp(files['photo'][0].buffer)
      .resize({ width: 1024 })
      .jpeg({ quality: 70 })
      .toBuffer();

      const compressedFile = {
        originalname: files['photo'][0].originalname.replace(/\.[^/.]+$/, ".jpg"),
        buffer: compressedBuffer,
        mimetype: 'image/jpeg',
      };

    const imageUrl = await uploadToS3(compressedFile, "ums");
    userBody.photo = imageUrl;
  }

  let saveAdmin = {};
  if (role.name == "vendor") {
    const compressedBuffer = await sharp(files['w9path'][0].buffer)
      .resize({ width: 1024 })
      .jpeg({ quality: 70 })
      .toBuffer();

      const compressedFile = {
        originalname: files['w9path'][0].originalname.replace(/\.[^/.]+$/, ".jpg"),
        buffer: compressedBuffer,
        mimetype: 'image/jpeg',
      };
    const imageUrl = await uploadToS3(compressedFile, "ums");
    userBody.w9path = imageUrl;

    if(userBody.kitchen_address && userBody.kitchen_address.street1) { 
      const fullAddress = `${userBody.kitchen_address.street1}, ${userBody.kitchen_address.street2 || ''}, ${userBody.kitchen_address.city}, ${userBody.kitchen_address.zip}, ${userBody.kitchen_address.state}`;
      const geoPoint = await getCoordinatesFromAddress(fullAddress);
      userBody.kitchen_address.coordinates = geoPoint; 
    }
    
    let vendorId;
    let existVId;
    do {
      vendorId = await generateUniqueId("VEN");
      existVId = await Admin.findOne({ vendor_id: vendorId });
    } while (existVId);
    
    saveAdmin = {
      ...userBody,
      user: user._id, 
      vendor_id: vendorId
    };
  } else { 
    saveAdmin = {
      ...userBody,
      user: user._id
    };
  }
   
  let admin = await Admin.create(saveAdmin);
  
  admin = admin.toObject();
  await sendAccountCreationEmail(user.email, admin.name, user.username, password);
  console.log("Username and Password", {username: user.username, password});

  admin.unified_user = {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: { ...role.toObject(), permissions: undefined }
  };
 
  // Send baordlink and Creds to Admin
  // await sendAccountCreationEmail(admin.user.email, admin.name, admin.user.username, password);

  return admin;
};

const allAdminUsers = async (user, status) => { 

  let query = {};
    
  if (user.role.name === 'admin') {
    query._id = {$ne: user._id}; 
  } else { 
    query.createdBy = user._id;
  }
  
  let users = await User.find(query)
  .select('-password -hierarchyLevel')
  .populate('role', 'name description') 
  .sort({createdAt: -1})
  .lean();

  if (users.length === 0) return [];

  const userIds = users.map(u => u._id);
  const createdByUserIds = [...new Set(users.map(u => u.createdBy).filter(Boolean))];
 
  const admins = await Admin.find({ user: { $in: userIds } }).select('-otp').lean();
  const adminMap = new Map(admins.map(admin => [admin.user.toString(), admin]));

  let createdByAdminMap = new Map();

  if (createdByUserIds.length > 0) {
    const createdByAdmins = await Admin.find({ user: { $in: createdByUserIds } }).select('user name').lean();

    createdByAdminMap = new Map(createdByAdmins.map(ca => [ca.user.toString(), ca.name]));
  } 

    const finalList = users
    .map(u => {
      const admin = adminMap.get(u._id.toString());
      if (!admin) return null;

      u.createdByName = u.createdBy ? createdByAdminMap.get(u.createdBy.toString()) || null : null;

      // Filter by status unless it's 'all'
      if (status === 'all' || admin.status === status) {
        return {
          ...admin,
          unified_user: u,
        };
      }

      return null;    
    })
    .filter(Boolean);
 
  
  return finalList;
};

const usersByRoleId = async (currentUser, query) => { 
  let { roleId, type } = query;
  const role = await Role.findById(roleId).populate('organization');
  if (!role) {
    throw new ApiError(status.NOT_FOUND, 'Role not found');
  }
  
  if(role.name == "rider") {
    let vendorId = await getVendorIdForUser(currentUser);
    if (!vendorId) {
      throw new ApiError(status.FORBIDDEN, 'You are not allowed to view riders');
    }
    let riders = await Rider.find({ vendorId: vendorId, status: "active" })
      .populate({
        path: "user",
        select: "username email role",
        populate: {
          path: "role",
          select: "name description"
        }
      })
      .sort({createdAt: -1})
      .lean();
 
    // add unified_user
    let users = riders.map(rider => {
      const user = rider.user;
      delete rider.user;
      return {
        ...rider,
        unified_user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    });

    return users;

  } else { 
    if ((type === 'task' || type === 'chat') && role.name == 'vendor' && currentUser.organization.name !== 'admin-organization') {
    // Fetch only the vendor of that organization
    const vendorRole = await Role.findOne({ name: 'vendor', organization: role.organization._id });
    if (!vendorRole) {
      throw new ApiError(status.NOT_FOUND, 'Vendor role not found for this organization');
    }
    const vendorUser = await User.findOne({ role: vendorRole._id, organization: currentUser.organization._id })
      .select('-password -hierarchyLevel') 
      .populate('role', 'name description')
      .populate("createdBy", "username email") 
      .sort({createdAt: -1})
      .lean();
    if (!vendorUser) {
      throw new ApiError(status.NOT_FOUND, 'Vendor user not found');
    }
    let user = await Admin.findOne({ user: vendorUser._id, status: 'active' }).select('-w9path -otp').lean();
    user.unified_user = vendorUser || {};
    user = [user];
    // Remove currentUser from users if type is 'chat'
    if (currentUser?._id) {
      user = user.filter(u => u.unified_user._id.toString() !== currentUser._id.toString());
    }

    return user;
    } else {
      let unified_users = await User.find({role: roleId})
      .select('-password -hierarchyLevel') 
      .populate('role', 'name description')
      .populate("createdBy", "username email") 
      .sort({createdAt: -1})
      .lean();

      const userIds = unified_users.map(u => u._id);
      const admins = await Admin.find({ user: { $in: userIds }, status: 'active' }).select('-w9path -otp').lean();
      const adminMap = new Map(admins.map(admin => [admin.user.toString(), admin]));

      let users = unified_users.map(u => {
          const admin = adminMap.get(u._id.toString());
          if (!admin) return null;
          return { ...admin, unified_user: u };
        })
        .filter(Boolean);
    
        // Remove currentUser from users if type is 'chat'
        if ((type === 'task' || type === 'chat') && currentUser?._id) {
          users = users.filter(u => u.unified_user._id.toString() !== currentUser._id.toString());
        }
        return users; 
    } 
  } 
};
  
const getAdminUserById = async (id) => { 
  let unified_user = await User.findById(id)
  .select('-password -hierarchyLevel')
  .populate('role', 'name description')
  .populate("createdBy", "username email")
  .lean();
 
    if (!unified_user){
      throw new ApiError(status.NOT_FOUND, 'user not found');
    } 

  let user = await Admin.findOne({user: unified_user._id}).select("-w9path -otp").lean();
  user.unified_user = unified_user;
  return user;
};

const updateAdminUserById = async (currentUser, id, files, updateBody) => { 
  let user = await getAdminUserById(id);  
  if (!user || !user.unified_user) {
    throw new ApiError(status.NOT_FOUND, 'user not found');
  }  

  if (
    currentUser.role.name !== 'admin' &&
    String(user.unified_user.createdBy) !== String(currentUser._id)
  ) {
    throw new ApiError(status.FORBIDDEN, 'You are not allowed to update this user');
  }

  if(updateBody.email) { 
    const emailExist = await User.findOne({email: updateBody.email, _id: { $ne: id }});
    if (emailExist) {
      throw new ApiError(status.BAD_REQUEST, 'Email already taken');
    } 
  }

  if(files['photo']) {
    const imageKey = user.photo?.split(`.amazonaws.com/`)[1]; // Extract key from URL
    if (imageKey) {
      await deleteFromS3(imageKey);  
    }

    const imageUrl = await uploadToS3(files['photo'][0], "ums");
    updateBody.photo = imageUrl;
  }

  if (user.unified_user.role.name == "vendor" && files['w9path']) { 
    const imageKey = user.w9path?.split(`.amazonaws.com/`)[1]; // Extract key from URL
    if (imageKey) {
      await deleteFromS3(imageKey);  
    }

    const imageUrl = await uploadToS3(files['w9path'][0], "ums");
    updateBody.w9path = imageUrl;
  }

  if(updateBody.kitchen_address && updateBody.kitchen_address.street1) {
    const fullAddress = `${updateBody.kitchen_address.street1}, ${updateBody.kitchen_address.street2 || ''}, ${updateBody.kitchen_address.city}, ${updateBody.kitchen_address.zip}, ${updateBody.kitchen_address.state}`;
    const geoPoint = await getCoordinatesFromAddress(fullAddress);
    updateBody.kitchen_address.coordinates = geoPoint; 
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(
    user._id,
    { $set: updateBody },
    { new: true, runValidators: true }  
  );

  if(updateBody.email){ 
    const updatedRole = await User.findByIdAndUpdate(
      id,
      { $set: {email: updateBody.email} },
      { new: true, runValidators: true }  
    );
  }

  let updatedUser = await userService.getUserById(id); 
  return updatedUser;
};

const updateStatusByAdmin = async (currentUser, id, newStatus) => { 
  if (currentUser.role.name !== 'admin') {
    throw new ApiError(status.FORBIDDEN, 'You do not have permissions');
  }

  let user = await getAdminUserById(id);  
  if (!user || !user.unified_user) {
    throw new ApiError(status.NOT_FOUND, 'user not found');
  }  
    
  const updatedAdmin = await Admin.findByIdAndUpdate(
    user._id,
    { $set: {status: newStatus} },
    { new: true, runValidators: true }  
  ); 

  return await userService.getUserById(id);  
};

const deleteAdminUserById = async (id) => {
  let user = await getAdminUserById(id);  
  if (!user || !user.unified_user){
    throw new ApiError(status.NOT_FOUND, 'user not found');
  } 
  
  await Admin.findByIdAndDelete(user._id);
  await User.findByIdAndDelete(user.unified_user._id);
  return;
};

module.exports = {
  loggedInUser,
  createAdminUser,
  allAdminUsers, 
  usersByRoleId,
  getAdminUserById,
  updateAdminUserById,
  updateStatusByAdmin,
  deleteAdminUserById
};
