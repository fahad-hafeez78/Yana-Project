const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
// const mongoose = require('mongoose');
const { User, Admin, Customer, Meal, Menu, Rider, Route, AssignMenu } = require('../models'); 
const { uploadToS3, deleteFromS3 } = require('./s3Bucket.service');
const { getVendorIdForUser } = require('../utils/helper');


const allVendors = async (currentUser, filter) => { 
  let query = [];
  let statusFilter = ["active", "inactive"];
  if (filter == 'active') {
    statusFilter = ['active'];
  } else if (filter == 'inactive') {
    statusFilter = ['inactive'];
  }

  const vendorId = await getVendorIdForUser(currentUser);

  query.push({
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "unified_user"
    }
  });

  query.push({
    $unwind: {
      path: "$unified_user",
      preserveNullAndEmptyArrays: false, // Ensures only records with users are kept
    },
  });
  
  query.push({
    $lookup: {
      from: "roles",
      localField: "unified_user.role",
      foreignField: "_id",
      as: "unified_user.role"
    }
  });

  query.push({
    $unwind: {
      path: "$unified_user.role",
      preserveNullAndEmptyArrays: false,
    },
  });

  if (vendorId === null) {
    query.push({
      $match: {
        "unified_user.role.name": "vendor",
        "status": { $in: statusFilter }
      }
    });
  } else {
    query.push({
      $match: {
        "unified_user.role.name": "vendor",
        "status": { $in: statusFilter },
        "_id": vendorId
      }
    });
  }

  query.push({
    $project: {
      "unified_user.password": 0,
      "unified_user.hierarchyLevel": 0,
      "unified_user.hierarchyPath": 0, 
      "unified_user.createdBy": 0,
      "unified_user.username": 0,
      "unified_user.role.permissions": 0, 
      "unified_user.role.createdBy": 0,
      "unified_user.role.createdAt": 0,
      "unified_user.role.updatedAt": 0
    }
  });

  query.push({
    $sort: { createdAt: -1 },
  });

  const vendors = await Admin.aggregate(query);
  return vendors;
};
  
const getVendorById = async (id) => {

  let unified_user = await User.findById(id)
    .select('email role')
    .populate('role', 'name description')
    .lean();


  if (!unified_user || !unified_user.role || unified_user.role.name != "vendor") {
    throw new ApiError(status.NOT_FOUND, 'vendor not found');
  }

  const vendor = await Admin.findOne({ user: unified_user._id }).select("-otp").lean();
  if (!vendor) {
    throw new ApiError(status.NOT_FOUND, 'vendor not found');
  }

  vendor.unified_user = unified_user;
  delete vendor.user;
  return vendor;
};

const updateVendorById = async (id, files, updateBody) => {
  const vendor = await getVendorById(id);
  if (!vendor.unified_user || !vendor.unified_user.role || vendor.unified_user.role.name != 'vendor') {
    throw new ApiError(status.NOT_FOUND, 'vendor not found');
  }

  if (updateBody.email) {
    await User.findByIdAndUpdate(id, { email: updateBody.email });
  }

  if (files) {
    if (files['photo']) {
      const imageKey = vendor.photo?.split(`.amazonaws.com/`)[1]; // Extract key from URL
      if (imageKey) {
        await deleteFromS3(imageKey);
      }

      const imageUrl = await uploadToS3(files['photo'][0], "ums");
      updateBody.photo = imageUrl;
    }
    if (files['w9path']) {
      const imageKey = vendor.w9path?.split(`.amazonaws.com/`)[1]; // Extract key from URL
      if (imageKey) {
        await deleteFromS3(imageKey);
      }

      const imageUrl = await uploadToS3(files['w9path'][0], "ums");
      updateBody.w9path = imageUrl;
    }
  }

  const updatedVendor = await Admin.findByIdAndUpdate(
    vendor._id,
    { $set: updateBody },
    { new: true, runValidators: true }
  );

  return await getVendorById(id);
};

const softDeleteVendor = async (id) => {
  const vendor = await getVendorById(id); 

  // if a vendor have active customers then vendor should not delete
  let customers = await Customer.find({vendorId: vendor._id});
  if(customers.length > 0) {
    throw new ApiError(status.BAD_REQUEST, 'Some customers belong to this vendor, so you can not delete.');
  }

  const updatedVendor = await Admin.findByIdAndUpdate(
    vendor._id,
    { $set: { status: 'soft_delete' } },
    { new: true, runValidators: true }
  );

  return;
};

const getDeletedVendors = async (currentUser) => { 
  if(currentUser.role.name !== 'admin') {
    throw new ApiError(status.UNAUTHORIZED, 'Only Admin can view deleted vendors');
  }
  const vendors = await Admin.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "unified_user"
      }
    },
    {
      $unwind: {
        path: "$unified_user",
        preserveNullAndEmptyArrays: false, // Ensures only records with users are kept
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "unified_user.role",
        foreignField: "_id",
        as: "unified_user.role"
      }
    },
    {
      $unwind: {
        path: "$unified_user.role",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        "unified_user.role.name": "vendor",
        "status": { $eq: 'soft_delete' }
      }
    },
    {
      $project: {
        "unified_user.password": 0,
        "unified_user.hierarchyLevel": 0,
        "unified_user.hierarchyPath": 0, 
        "unified_user.createdBy": 0,
        "unified_user.username": 0,
        "unified_user.role.permissions": 0, 
        "unified_user.role.createdBy": 0,
        "unified_user.role.createdAt": 0,
        "unified_user.role.updatedAt": 0
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);
  return vendors; 
};

const deleteVendorById = async (id, currentUser) => {
  if(currentUser.role.name !== 'admin') {
    throw new ApiError(status.UNAUTHORIZED, 'Only Admin can delete vendors');
  }
  const vendor = await getVendorById(id);
  // if a vendor have active customers then vendor should not delete
  let customers = await Customer.find({vendorId: vendor._id});
  if(customers.length > 0) {
    throw new ApiError(status.BAD_REQUEST, 'Some customers belong to this vendor, so you can not delete.');
  } 
    
  await Admin.findByIdAndDelete(vendor._id);
  await User.findByIdAndDelete(id);
  await Meal.deleteMany({ vendorId: vendor._id });
  await Menu.deleteMany({ vendorId: vendor._id });
  await AssignMenu.deleteMany({ vendorId: vendor._id });
  await Rider.deleteMany({ vendorId: vendor._id });
  await Route.deleteMany({ vendorId: vendor._id });

  return;
};

module.exports = {
  allVendors, 
  getVendorById,
  updateVendorById,
  softDeleteVendor,
  getDeletedVendors,
  deleteVendorById
};
