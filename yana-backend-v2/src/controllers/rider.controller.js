const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { riderService } = require('../services');
 
const createRider = catchAsync(async (req, res) => {
    const rider = await riderService.createRider(req.user, req.file, req.body);
    res.status(status.CREATED).send({ success: true, message: 'Rider Created Success', rider });
})
  
const getAllRiders = catchAsync(async (req, res) => { 
    const riders = await riderService.getAllRiders(req.user, req.query);
    res.status(status.OK).send({ success: true, riders });
});

const getRider = catchAsync(async (req, res) => {
    const rider = await riderService.getRiderById(req.params.id);
    res.status(status.OK).send({ success: true, rider });
});
  
const updateRider = catchAsync(async (req, res) => {
    const rider = await riderService.updateRiderById(req.params.id, req.file, req.body);
    res.status(status.OK).send({ success: true, message: 'Rider Updated Success', rider });
});
  
const deleteRider = catchAsync(async (req, res) => {
    await riderService.deleteRiderById(req.params.id);
    res.status(status.OK).send({ success: true, message: "Rider Deleted Success" });
});

const loggedInRiderDetails = catchAsync(async (req, res) => {
    const user = await riderService.loggedInRiderDetails(req.user);
    res.status(status.OK).send({ success: true, message: "LoggedIn Rider Details", user});
});

const updateRiderImage = catchAsync(async (req, res) => {
  const rider = await riderService.updateRiderImage(req.user, req.file);
  res.status(status.OK).send({ success: true, message: 'Profile Picture Updated Successfully', rider });
});
 

module.exports = {  
    createRider,
    getAllRiders, 
    getRider,
    updateRider,
    deleteRider,
    loggedInRiderDetails,
    updateRiderImage, 
};
