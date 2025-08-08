const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { zoneService } = require('../services');

const createZone = catchAsync(async (req, res) => {
    const zone = await zoneService.createZone(req.body);
    res.status(status.CREATED).send({ success: true, message: "Zone Created Success", zone});
});
  
const getAllZones = catchAsync(async (req, res) => { 
    const zones = await zoneService.getAllZones();
    res.status(status.OK).send({ success: true, zones });
});

const getZone = catchAsync(async (req, res) => {
    const zone = await zoneService.getZoneById(req.params.id);
    res.status(status.OK).send({ success: true, zone });
});
  
const updateZone = catchAsync(async (req, res) => {
    const zone = await zoneService.updateZoneById(req.params.id, req.body);
    res.status(status.OK).send({ success: true, message: 'Zone Updated Success', zone });
});
  
const deleteZone = catchAsync(async (req, res) => {
    await zoneService.deleteZoneById(req.params.id);
    res.status(status.OK).send({ success: true, message: "Zone Deleted Success" });
});


module.exports = {
    createZone,
    getAllZones, 
    getZone,
    updateZone,
    deleteZone
}; 
