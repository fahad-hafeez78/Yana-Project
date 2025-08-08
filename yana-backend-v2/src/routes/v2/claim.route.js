const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { claimValidation } = require('../../validations');
const { claimController } = require('../../controllers'); 

const router = express.Router();

// Create
router.post('/create', checkPermission("claim", "create"), validate(claimValidation.createClaim), claimController.createClaim);
// Get All
router.get('/all', checkPermission("claim", "view"), validate(claimValidation.getAllClaims), claimController.getAllClaims);
// Get Statistics weekly, monthly, yearly
router.get('/statistics', checkPermission("claim", "view"), validate(claimValidation.getClaimsStatistics), claimController.getClaimsStatistics);
// Get by ID 
router.get('/:id', checkPermission("claim", "view"), validate(claimValidation.singleClaim), claimController.getSingleClaim);
// Update a claim by ID
router.put('/:id', checkPermission("claim", "edit"), validate(claimValidation.updateClaim), claimController.updateClaim);
// Delete a claim by ID
router.delete('/:id', checkPermission("claim", "delete"), validate(claimValidation.singleClaim), claimController.deleteClaim);


module.exports = router;