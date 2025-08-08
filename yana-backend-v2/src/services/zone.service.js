const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
const { Zone } = require('../models'); 


const createZone = async (body) => { 
  return await Zone.create(body);
};

const getAllZones = async () => {
    const zones = await Zone.find();
    return zones;
};

const getZoneById = async (id) => {
    let zone = await Zone.findById(id);
    if (!zone) {
      throw new ApiError(status.NOT_FOUND, 'zone not found');
    } 
    return zone;
};

const updateZoneById = async (id, updateBody) => {
    const zone = await getZoneById(id);
    if (!zone) {
      throw new ApiError(status.NOT_FOUND, 'zone not found');
    } 

    const updatedZone = await Zone.findByIdAndUpdate(id, updateBody, { new: true, runValidators: true });
    return updatedZone;
};

const deleteZoneById = async (id) => {
    const zone = await getZoneById(id);
    if (!zone) {
      throw new ApiError(status.NOT_FOUND, 'zone not found');
    }
    await Zone.findByIdAndDelete(id);
    return;
};

module.exports = {
    createZone,
    getAllZones,
    getZoneById,
    updateZoneById,
    deleteZoneById
};
