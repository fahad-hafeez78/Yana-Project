const { status } = require('http-status');   
const catchAsync = require('../utils/catchAsync');
const { vendorService } = require('../services');

const allVendors = catchAsync(async (req, res) => { 
    if (!req.query.filter) {
        req.query.filter = 'all';
    }
    const vendors = await vendorService.allVendors(req.user, req.query.filter);
    res.status(status.OK).send({ success: true, message: 'Vendors Fetched Successfully', vendors });
});
 
const getVendor = catchAsync(async (req, res) => {
    const vendor = await vendorService.getVendorById(req.params.id); 
    res.status(status.OK).send({ success: true, message: 'Vendor Fetched Successfully', vendor });
});
  
const updateVendor = catchAsync(async (req, res) => {
    const vendor = await vendorService.updateVendorById(req.params.id, req.files, req.body);
    res.status(status.OK).send({ success: true, message: 'Vendor Updated Successfully', vendor });
});

const softDeleteVendor = catchAsync(async (req, res) => {
    await vendorService.softDeleteVendor(req.params.id);
    res.status(status.OK).send({ success: true, message: 'Vendor moved to trash' });
});

const getDeletedVendors = catchAsync(async (req, res) => {
    const vendors = await vendorService.getDeletedVendors(req.user); 
    res.status(status.OK).send({ success: true, message: 'Vendor Fetched Successfully', vendors });
});
  
const deleteVendor = catchAsync(async (req, res) => {
    await vendorService.deleteVendorById(req.params.id, req.user);
    res.status(status.OK).send({ success: true, message: 'Vendor Deleted Successfully' });
});


module.exports = { 
    allVendors, 
    getVendor,
    updateVendor,
    softDeleteVendor,
    getDeletedVendors,
    deleteVendor,
}; 
