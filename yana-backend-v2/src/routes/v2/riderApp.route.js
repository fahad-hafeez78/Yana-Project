const express = require('express'); 
const validate = require('../../middlewares/validate');
const { riderValidation } = require('../../validations');
const { riderController } = require('../../controllers'); 
const upload = require('../../utils/multer');

const router = express.Router();
  
// LoggedIn Rider
router.get('/me', riderController.loggedInRiderDetails); 
  
// Update Profile Picture
router.patch('/profile-picture-update', upload.single("photo"), riderController.updateRiderImage); 
 

module.exports = router;