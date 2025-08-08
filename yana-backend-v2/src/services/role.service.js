const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
const { Role, User, Customer, Admin, Organization } = require('../models');  
const { getVendorIdForUser, syncChildRolePermissions } = require('../utils/helper');


const createRole = async (user, body) => {   
  if (body.name.toLowerCase() == 'admin') {
    throw new ApiError(status.FORBIDDEN, 'Can not create admin Role');
  } 

  if (body.name.toLowerCase() == 'customer') {
    throw new ApiError(status.FORBIDDEN, 'Can not create customer Role');
  } 

  if (body.name.toLowerCase() == 'rider') {
    throw new ApiError(status.FORBIDDEN, 'Can not create rider Role');
  }

  // Only one vendor role can create
  if (body.name.toLowerCase() == 'vendor') {
    const existingVendorRole = await Role.findOne({ name: 'vendor' });
    if (existingVendorRole) {
      throw new ApiError(status.BAD_REQUEST, 'Vendor role already exists');
    }
  }
  
  const parentRole = await Role.findById(body.parentRole);
  if (!parentRole) throw new ApiError(status.BAD_REQUEST, 'Parent role not found');

  // Set hierarchyLevel based on parentRole 
  if (parentRole.hierarchyLevel === 1) body.hierarchyLevel = 2; // Vendor under admin
  else if (parentRole.hierarchyLevel === 2) body.hierarchyLevel = 3; // Manager under vendor
  else throw new ApiError(status.BAD_REQUEST, 'Role hierarchy limit reached: You cannot create a role beyond the third level.');

  
  const parentUserData = await User.findById(body.parentUser);
  if (!parentUserData) throw new ApiError(status.BAD_REQUEST, 'Parent user not found');

  // Prevent duplicate role names for same parent
  const existingRole = await Role.findOne({ name: body.name, parentUser: body.parentUser });
  if (existingRole) throw new ApiError(status.BAD_REQUEST, 'Role already exists under this parent');

  body.organization = parentUserData.organization;
  let newRole = await Role.create(body);
  return newRole;
};

const allRoles = async (currentUser) => { 
  let query = {};
     
  if (currentUser.role.name === 'admin') {
    query = {name: { $nin: ['customer', 'rider'] }};
  } else {
    query.parentUser = currentUser._id;
  }

  const roles = await Role.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "role",
        as: "users"
      }
    },
    {
      $addFields: {
        userCounts: { $size: "$users" },
        parentUserId: "$parentUser"
      }
    }, 
    {
      $lookup: {
        from: 'admins',
        let: { parentUserId: '$parentUserId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$$parentUserId', '$user'] } } },
          { $project: { _id: 1, name: 1 } },           
        ],
        as: 'parentAdmin',
      },
    },
    { 
      $addFields: { 
        parentUser: {
          $mergeObjects: [
            { parentUserId: "$parentUserId" },                  
            { $arrayElemAt: ["$parentAdmin", 0] }            
          ]
        }
      } 
    }, 
    {
      $project: {
        users: 0,  
        parentAdmin: 0,
        parentUserId: 0
      }
    }
  ]);

  await Role.populate(roles, [
    { path: "parentRole", select: "name permissions" }
  ]);
 
  return roles;
};

const dropDownListing = async (currentUser, query) => {
  const { type } = query;

  if (type == 'user') {
    let query = { name: { $nin: ['customer', 'rider'] } };
    if (currentUser.role.name !== 'admin') query.parentUser = currentUser._id;
    return await Role.find(query).select('name parentRole parentUser');
  } 

  if (type == 'task') {
    // 1. Find admin organization
    const adminOrg = await Organization.findOne({ name: 'admin-organization' });
    if (!adminOrg) throw new ApiError(status.NOT_FOUND, 'Admin organization not found');

    // 2. Build role query
    let roleQuery = {};
    if (String(currentUser.organization._id) === String(adminOrg._id)) {
      // Admin org user: show all admin org roles except customer/rider
      roleQuery = { 
        name: { $nin: ['customer', 'rider'] }
      };
    } else {
      // Vendor org user: show all roles from their org and admin org
      roleQuery = {
        organization: { $in: [currentUser.organization._id, adminOrg._id] },
        name: { $nin: ['customer', 'rider'] }
      };
    }

    // 3. Fetch roles
    const roles = await Role.find(roleQuery).select('name parentRole parentUser organization');
    return roles;
  }

  if (type == 'chat') {
    // 1. Find admin organization
    const adminOrg = await Organization.findOne({ name: 'admin-organization' });
    if (!adminOrg) throw new ApiError(status.NOT_FOUND, 'Admin organization not found');

    // 2. Build role query
    let roleQuery = {};
    if (String(currentUser.organization._id) === String(adminOrg._id)) {
      // Admin org user: show all admin org roles except customer/rider
      roleQuery = { 
        name: { $nin: ['customer', 'rider'] }
      };
    } else {
      // Vendor org user: show all roles from their org and admin org
      roleQuery = {
        organization: { $in: [currentUser.organization._id, adminOrg._id] },
        name: { $nin: ['customer'] }
      };
    }

    // 3. Fetch roles
    const roles = await Role.find(roleQuery).select('name parentRole parentUser organization');
    return roles;
  }

  if (type == 'ticket') {
    if (!query.ticket_vendor_userId) {
      throw new ApiError(status.BAD_REQUEST, 'UserId of vendor is required for ticket roles');
    }
    let ticketVendorUser = await User.findById(query.ticket_vendor_userId).lean();

    // 2. All vendor roles
    const vendorRole = await Role.findOne({ name: 'vendor' });

    // 3. All children of vendors
    let vendorUsers = await User.find({ role: vendorRole._id }).lean();
    // filter vendor user  
    vendorUsers = vendorUsers.filter(u => String(u._id) === String(ticketVendorUser._id));

    const vendorChildRoles = await Role.find({
      parentUser: { $in: vendorUsers.map(u => u._id) }
    });

    // 1. Find admin organization
    const adminOrg = await Organization.findOne({ name: 'admin-organization' });
    if (!adminOrg) throw new ApiError(status.NOT_FOUND, 'Admin organization not found');

    // 2. Build role query
    let roleQuery = {};
    if (String(currentUser.organization._id) === String(adminOrg._id)) {
      // Admin org user: show all admin org roles except customer/rider
      roleQuery = { 
        organization: { $in: [adminOrg._id] },
        name: { $nin: ['customer', 'rider'] }
      };
    } else {
      // Vendor org user: show all roles from their org and admin org
      roleQuery = {
        organization: { $in: [currentUser.organization._id, adminOrg._id] },
        name: { $nin: ['customer', 'rider'] }
      };
    }

    // 3. Fetch roles
    const roles = await Role.find(roleQuery).select('name parentRole parentUser organization');

    const allAssignableRoles = [
      ...roles,
      ...vendorChildRoles
    ]; 
    const uniqueRoles = allAssignableRoles.reduce((acc, role) => {
      if (!acc.some(r => r._id.equals(role._id))) {
        acc.push({
          _id: role._id,
          name: role.name,
          parentRole: role.parentRole,
          parentUser: role.parentUser,
          organization: role.organization
        });
      }
      return acc;
    }, []);

    return uniqueRoles;
  }
 
  return [];
};
  
const getRoleById = async (currentUser, id) => { 
  let role = await Role.findById(id) 
  .populate('parentRole', 'name')
  .populate("parentUser", "username email");

  if (!role) {
    throw new ApiError(status.NOT_FOUND, 'role not found');
  } 

  if (currentUser.role.name !== 'admin' && String(role.parentUser._id) !== String(currentUser._id)) {
    throw new ApiError(status.FORBIDDEN, 'Not authorized to view this role');
  }

  return role;
};

const updateRoleById = async (currentUser, id, updateBody) => {
  const role = await Role.findById(id);
  if (!role) throw new ApiError(status.NOT_FOUND, 'role not found');  

  if (['admin', 'customer', 'rider'].includes(updateBody.name.toLowerCase())) {
    throw new ApiError(status.FORBIDDEN, 'Cannot update to a system role name');
  }

    const existingRole = await Role.findOne({ parentRole: role.parentRole, name: updateBody.name, _id: { $ne: id } });
    if (existingRole) {
      throw new ApiError(status.BAD_REQUEST, 'Role already exists with this name');
    } 

    const parentRole = await Role.findById(updateBody.parentRole);
    if (!parentRole) throw new ApiError(status.BAD_REQUEST, 'Parent role not found');

    // Set hierarchyLevel based on parentRole 
    if (parentRole.hierarchyLevel === 1) updateBody.hierarchyLevel = 2; // Vendor under admin
    else if (parentRole.hierarchyLevel === 2) updateBody.hierarchyLevel = 3; // Manager under vendor
    else throw new ApiError(status.BAD_REQUEST, 'Role hierarchy limit reached: You cannot create a role beyond the third level.');

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { $set: updateBody },
      { new: true, runValidators: true }  
    );

    // Sync child roles' permissions
    await syncChildRolePermissions(updatedRole._id, updatedRole.permissions);

    return updatedRole;
};

const deleteRoleById = async (id) => {
  const role = await Role.findById(id);
  if (!role) throw new ApiError(status.NOT_FOUND, 'role not found');
   
  // Check Users of this role 
  let users = await User.find({role: id});
  if(users.length > 0) {
    throw new ApiError(status.NOT_FOUND, 'You cannot delete this role until all users are removed.');
  }
 
  await Role.findByIdAndDelete(id);
  return;
};

module.exports = {
    createRole,
    allRoles, 
    dropDownListing, 
    getRoleById,
    updateRoleById,
    deleteRoleById
};
