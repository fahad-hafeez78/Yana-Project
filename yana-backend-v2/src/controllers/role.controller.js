const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { roleService } = require('../services');

const createRole = catchAsync(async (req, res) => { 
    const role = await roleService.createRole(req.user, req.body);
    res.status(status.CREATED).send({ success: true, message: "Role Created Success", role});
});

const allRoles = catchAsync(async (req, res) => { 
    const roles = await roleService.allRoles(req.user);
    res.status(status.OK).send({ success: true, roles });
});

const dropDownListing = catchAsync(async (req, res) => { 
    const roles = await roleService.dropDownListing(req.user, req.query);
    res.status(status.OK).send({ success: true, roles });
});
  
const getRole = catchAsync(async (req, res) => {
    const role = await roleService.getRoleById(req.user, req.params.id);
    res.status(status.OK).send({ success: true, role });
});
  
const updateRole = catchAsync(async (req, res) => {
    const role = await roleService.updateRoleById(req.user, req.params.id, req.body);
    res.status(status.OK).send({ success: true, message: 'Role Updated Success', role });
});
  
const deleteRole = catchAsync(async (req, res) => {
    await roleService.deleteRoleById(req.params.id);
    res.status(status.OK).send({ success: true, message: "Role Deleted Success" });
});


module.exports = {
    createRole,
    allRoles,  
    dropDownListing,
    getRole,
    updateRole,
    deleteRole
}; 
