const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
const { Menu, AssignMenu, Admin } = require('../models'); 
const { uploadToS3, deleteFromS3 } = require('./s3Bucket.service');
const moment = require('moment-timezone');
const { getVendorIdForUser } = require('../utils/helper');

const createMenu = async (file, body) => { 
  let menu = await Menu.findOne({name: body.name, vendorId: body.vendorId});
  if (menu) {
    throw new ApiError(status.BAD_REQUEST, 'menu already exist with this name');
  }

  if(file){  
    const imageUrl = await uploadToS3(file, "menus");
    body.image = imageUrl;
  }

  let vendor = await Admin.findById(body.vendorId).populate({
    path: "user",
    select: "-password",
    populate: {
        path: "role",
        select: "name description permissions"
    }
  });
  if (!vendor) {
    throw new ApiError(status.NOT_FOUND, 'vendor not found');
  } 
  if (vendor.user.role.name != 'vendor') {
    throw new ApiError(status.NOT_FOUND, 'this is not vendor Id');
  }
    
  return await Menu.create(body);
};

const getAllMenus = async (currentUser) => {
  let query = {};
  let vendorId = await getVendorIdForUser(currentUser);
     
  if (vendorId) { 
    query.vendorId = vendorId; 
  }
  const menus = await Menu.find(query).populate("meals").populate("vendorId", "name");
  return menus;
};

const vendorMenus = async (vendorId) => {  
    const menus = await Menu.find({vendorId: vendorId})
    .populate("vendorId", "name rating");

    return menus;  
};

const createOrUpdateAssignMenu = async (body) => {  
  let vendor = await Admin.findById(body.vendorId).populate({
    path: "user",
    select: "-password",
    populate: {
        path: "role",
        select: "name description permissions"
    }
  });
  if (!vendor) {
    throw new ApiError(status.NOT_FOUND, 'vendor not found');
  } 
  if (vendor.user.role.name != 'vendor') {
    throw new ApiError(status.NOT_FOUND, 'this is not vendor Id');
  } 

  // Validate each assignment's startDate and endDate
  for (const assignment of body.assignments) {
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);
    
    // Compare only date parts (ignoring time)
    const startDateUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (endDateUTC < startDateUTC) {
        throw new ApiError(status.BAD_REQUEST, 'End date must be on or after start date');
    }
  }

  const existAssigned = await AssignMenu.findOne({vendorId: body.vendorId});
  if (existAssigned) {  
    const updatedAssignment = await AssignMenu.findOneAndUpdate(
      {vendorId: body.vendorId},
      { $set: body },
      { new: true, runValidators: true }  
    );

    return updatedAssignment;
  } else {
    const assignment = await new AssignMenu({ 
      vendorId: body.vendorId, 
      assignments: body.assignments
    });
  
    return await assignment.save();
  }
   
};

const fetchAssignedMenus = async (user, body) => {  
  let query = {};
  let vendorId = await getVendorIdForUser(user);
     
  if (!vendorId) {
    if (!body || !body.vendorId) {
      throw new ApiError(status.NOT_FOUND, 'vendorId required');
    }
    query.vendorId = body.vendorId;
  } else {
    query.vendorId = vendorId;
  }
       
    let assignedMenu = await AssignMenu.findOne(query)
      .populate({
          path: 'assignments.menus',
          model: 'Menu'
      }).lean();
    if (!assignedMenu) {
      throw new ApiError(status.NOT_FOUND, 'no assigned menus found');
    }

    const now = moment().tz('America/New_York');

    // Find active assignments
    const activeAndFutureAssignments = assignedMenu.assignments.filter(assignment => 
      now.isSameOrBefore(moment(assignment.endDate).endOf('day'))
    );
 
    const activeAssignments = activeAndFutureAssignments.map(assignment => {
      const start = moment(assignment.startDate).startOf('day');
      const end = moment(assignment.endDate).endOf('day');
      return {
        ...assignment,
        isActive: now.isBetween(start, end, null, '[]')
      };
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    assignedMenu.assignments = activeAssignments;

    return assignedMenu;  
};
 
const getMenuById = async (id) => {
  let menu = await Menu.findById(id).populate("meals").populate("vendorId", "name");
  if (!menu) {
    throw new ApiError(status.NOT_FOUND, 'menu not found');
  } 
  return menu;
};

const updateMenuById = async (id, file, updateBody) => {
  const menu = await getMenuById(id);
  if (!menu) {
    throw new ApiError(status.NOT_FOUND, 'menu not found');
  } 

  if(file){
    const imageKey = menu.image ? menu.image.split(`.amazonaws.com/`)[1] : ''; // Extract key from URL
    if (imageKey) {
      await deleteFromS3(imageKey);  
    }

    const imageUrl = await uploadToS3(file, "menus");
    updateBody.image = imageUrl;
  }

  const updatedMenu = await Menu.findByIdAndUpdate(
    id,
    { $set: updateBody },
    { new: true, runValidators: true }  
  );
   
  return updatedMenu;
};

const deleteMenuById = async (id, currentUser) => {
  const menu = await getMenuById(id);
  if (!menu) {
    throw new ApiError(status.NOT_FOUND, 'Menu not found.');
  }

  if (menu.vendorId._id.toString() !== currentUser.admin_user._id.toString() && currentUser.role.name !== 'admin') {
    throw new ApiError(status.UNAUTHORIZED, "Only admin or vendor of this menu can delete menu");
  } 

  await AssignMenu.updateMany(
    { "assignments.menus": id },
    { $pull: { "assignments.$[].menus": id } }
  );

  await Menu.findByIdAndDelete(id);
  return;
};


module.exports = {
    createMenu,
    getAllMenus,
    vendorMenus,
    createOrUpdateAssignMenu,
    fetchAssignedMenus, 
    getMenuById,
    updateMenuById,
    deleteMenuById
};
