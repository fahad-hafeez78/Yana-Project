const jwt = require('jsonwebtoken');
const { status } = require('http-status');
const config = require('../config/config');
const { userService } = require('../services'); 
const { Role } = require('../models');

const auth = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(' ')[1];
  if (!token) {
    return res.status(status.UNAUTHORIZED).json({ message: "Auth Token Required" }); 
  } 
  
  try { 
    const decoded = jwt.verify(token, config.jwt.access_token_secret);
    let user_id = decoded.sub;  
    if (user_id) {  
      const user = await userService.getUserById(user_id);
      // if (!user) {   
      //   return res.status(status.UNAUTHORIZED).json({ message: "User Not Found" }); 
      // }
      req.user = user;
      next();
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(status.UNAUTHORIZED).json({ message: "Token Expired", expired: true }); 
    }
    return res.status(status.UNAUTHORIZED).json({ message: error.message });
  } 
};

const isAny_Admin = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || !user.role || !user.role.name || user.role.name == 'customer' || user.role.name == 'rider') {
      return res.status(status.FORBIDDEN).json({ message: "Unauthorized" }); 
    }
    // if (!user.admin_user || user.admin_user.status !== "active") {
    //   return res.status(status.FORBIDDEN).json({ message: "Account not approved" }); 
    // }
    next();
  } catch (e) {
    return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" }); 
  }
};

const isCustomer = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || !user.role) {
      return res.status(status.FORBIDDEN).json({ message: "Unauthorized" }); 
    }
    if (user.role.name !== "customer") {
      return res.status(status.FORBIDDEN).json({ message: "Access denied." });
    }
    next();
  } catch (e) {
    return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" }); 
  }
};

const isRider = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || !user.role) {
      return res.status(status.FORBIDDEN).json({ message: "Unauthorized" }); 
    }
    if (user.role.name !== "rider") {
      return res.status(status.FORBIDDEN).json({ message: "Access denied." });
    }
    next();
  } catch (e) {
    return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" }); 
  }
};
 
const checkPermission = (page, action) => {
  return async (req, res, next) => {
    const user = req.user;
    
    // if(user.role.name == 'admin'){
    //   return next();
    // }
    
    const hasPermission = user.role.permissions.some(
      perm => perm.page === page && perm.actions.includes(action)
    );

    if (!hasPermission) {
      return res.status(status.FORBIDDEN).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
};

const roleCreatorHasPermissions = async (req, res, next) => { 
  const { permissions } = req.body; 
 
  // Vendors can only assign permissions they have
  const currentRolePermissions = req.user.role.permissions;  
  const requestedPermissions = permissions || [];

  const isValid = requestedPermissions.every(reqPerm => {
    return currentRolePermissions.some(vPerm =>
      vPerm.page === reqPerm.page && reqPerm.actions.every(action => vPerm.actions.includes(action))
    );
  });

  if (!isValid) {
    return res.status(status.FORBIDDEN).json({ message: "You cannot assign permissions you don’t have" });
  }
 
  next(); 
};

// Ensure manager permissions are subset of vendor
const rolePermissionSubset = async (req, res, next) => {
  const { parentRole, permissions } = req.body;
  const p_role = await Role.findById(parentRole).lean();
  if (!p_role) return res.status(400).json({ message: 'Parent role not found' });

  const requestedPermissions = permissions || [];

  const parentPerms = p_role.permissions;
  const isValid = requestedPermissions.every(reqPerm => {
    return parentPerms.some(vPerm =>
      vPerm.page === reqPerm.page && reqPerm.actions.every(action => vPerm.actions.includes(action))
    );
  });

  if (!isValid) {
    return res.status(status.FORBIDDEN).json({ message: 'Parent cannot assign permissions he does not have.' });
  }
  
  next();
};
 

const isAdminRole = async (req, res, next) => {
  const user = req.user;
  if (!user || !user.role) {
    return res.status(status.FORBIDDEN).json({ message: "Unauthorized" });
  }
  if (user.role.name !== "admin") {
    return res.status(status.FORBIDDEN).json({ message: "Access denied." });
  } 
  next();
};

module.exports = { auth, isAny_Admin, isCustomer, isRider, checkPermission, rolePermissionSubset, isAdminRole };
