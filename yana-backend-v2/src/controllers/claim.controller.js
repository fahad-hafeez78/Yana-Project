const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { claimService } = require('../services');
 
  
const createClaim = catchAsync(async (req, res) => {
    const claim = await claimService.createClaim(req.body);
    res.status(status.CREATED).send({ success: true, message: 'Claim Created Success', claim });
});

const getAllClaims = catchAsync(async (req, res) => { 
    const claims = await claimService.getAllClaims(req.query.status);
    res.status(status.OK).send({ success: true, claims });
});

const getSingleClaim = catchAsync(async (req, res) => {
    const claim = await claimService.getSingleClaim(req.params.id);
    res.status(status.OK).send({ success: true, claim });
});

const getClaimsStatistics = catchAsync(async (req, res) => { 
    const statistics = await claimService.getClaimsStatistics(req.query); 
    res.status(status.OK).send({ success: true, statistics });
});


const updateClaim = catchAsync(async (req, res) => {
    const claim = await claimService.updateClaim(req.params.id, req.body);
    res.status(status.OK).send({ success: true, message: 'Claim updated successfully', claim });
});

const deleteClaim = catchAsync(async (req, res) => {
    await claimService.deleteClaim(req.params.id);
    res.status(status.OK).send({ success: true, message: 'Claim deleted successfully' });
});

module.exports = {
    createClaim,
    getAllClaims,
    getSingleClaim,
    getClaimsStatistics,
    updateClaim,
    deleteClaim,
}; 
