const express = require('express'); 
const { keyController } = require('../../controllers'); 
 
const router = express.Router();

router.get('/assetlinks', keyController.getAssetLinkKey);
 
module.exports = router;