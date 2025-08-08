const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { menuService } = require('../services');

const createMenu = catchAsync(async (req, res) => {
    const menu = await menuService.createMenu(req.file, req.body);
    res.status(status.CREATED).send({ success: true, message: "Menu Created Success", menu});
});
  
const getAllMenus = catchAsync(async (req, res) => { 
    const menus = await menuService.getAllMenus(req.user);
    res.status(status.OK).send({ success: true, message: "Menus Fetched Success", menus});
});

const vendorMenus = catchAsync(async (req, res) => { 
    const menus = await menuService.vendorMenus(req.params.vendorId);
    res.status(status.OK).send({ success: true, message: "Vendor Menus Fetched Success", menus });
});

const createOrUpdateAssignMenu = catchAsync(async (req, res) => {
    const assigned = await menuService.createOrUpdateAssignMenu(req.body);
    res.status(status.CREATED).send({ success: true, message: "Assigned Menus Updated Success", assigned });
});

const fetchAssignedMenus = catchAsync(async (req, res) => {
    const assignment = await menuService.fetchAssignedMenus(req.user, req.body);
    res.status(status.OK).send({ success: true, message: "Assigned Menus Fetched Success", assignment });
});
 
const getMenuById = catchAsync(async (req, res) => {
    const menu = await menuService.getMenuById(req.params.id);
    res.status(status.OK).send({ success: true, message: "Menu Fetched Success", menu});
});
  
const updateMenu = catchAsync(async (req, res) => {
    const menu = await menuService.updateMenuById(req.params.id, req.file, req.body);
    res.status(status.OK).send({ success: true, message: 'Menu Updated Success', menu});
});
  
const deleteMenu = catchAsync(async (req, res) => {
    await menuService.deleteMenuById(req.params.id, req.user);
    res.status(status.OK).send({ success: true, message: "Menu Deleted Success"});
});


module.exports = {
    createMenu,
    getAllMenus, 
    vendorMenus,
    createOrUpdateAssignMenu,
    fetchAssignedMenus, 
    getMenuById,
    updateMenu,
    deleteMenu
}; 
