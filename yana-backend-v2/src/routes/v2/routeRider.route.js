const express = require('express'); 
const validate = require('../../middlewares/validate');
const { routeValidation } = require('../../validations');
const { routeController } = require('../../controllers'); 
const upload = require('../../utils/multer');

const router = express.Router();
  
// Get Route of current rider  
router.get("/new", routeController.getRiderNewRoute);
// Get All Routes of current rider  
router.get("/all", routeController.getAllRoutesOfRider);
// Update Route Status
router.post("/update-route-status", validate(routeValidation.updateRouteStatus), routeController.updateRouteStatus);
// Update Order Status
router.patch("/update-order-status", upload.single('pod'), validate(routeValidation.updateOrderStatus), routeController.updateOrderStatus);
// Next Destination
router.post("/next-destination", validate(routeValidation.nextDestination), routeController.nextDestination);

module.exports = router;