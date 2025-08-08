const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { umsService } = require('../services');


const loggedInUser = catchAsync(async (req, res) => { 
    const user = await umsService.loggedInUser(req.user);
    res.status(status.OK).send({ success: true, user });
});

const createAdminUser = catchAsync(async (req, res) => {
    const user = await umsService.createAdminUser(req.user, req.files, req.body);
    res.status(status.CREATED).send({ success: true, message: "User Created Success", user});
});

const allAdminUsers = catchAsync(async (req, res) => { 
    const users = await umsService.allAdminUsers(req.user, req.query.status);
    res.status(status.OK).send({ success: true, users });
});

const usersByRoleId = catchAsync(async (req, res) => { 
    const users = await umsService.usersByRoleId(req.user, req.query);
    res.status(status.OK).send({ success: true, users });
});
  
const getAdminUser = catchAsync(async (req, res) => {
    const user = await umsService.getAdminUserById(req.params.id);
    res.status(status.OK).send({ success: true, user });
});
  
const updateAdminUser = catchAsync(async (req, res) => {
    const user = await umsService.updateAdminUserById(req.user, req.params.id, req.files, req.body);
    res.status(status.OK).send({ success: true, message: 'User Updated Success', user });
});

const updateStatusByAdmin = catchAsync(async (req, res) => {
    const user = await umsService.updateStatusByAdmin(req.user, req.params.id, req.body.status);
    res.status(status.OK).send({ success: true, message: 'User Updated Success', user });
});
  
const deleteAdminUser = catchAsync(async (req, res) => {
    await umsService.deleteAdminUserById(req.params.id);
    res.status(status.OK).send({ success: true, message: "User Deleted Success"});
});


module.exports = {
    loggedInUser,
    createAdminUser,
    allAdminUsers, 
    usersByRoleId,
    getAdminUser,
    updateAdminUser,
    updateStatusByAdmin,
    deleteAdminUser
}; 
