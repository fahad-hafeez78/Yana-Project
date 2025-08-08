const express = require('express');
const { checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { routeValidation } = require('../../validations');
const { routeController } = require('../../controllers'); 

const router = express.Router();

// Create Route of a Vendor
router.post("/create/:vendorId", checkPermission("route", "create"), validate(routeValidation.createAndAssigneRoutes), routeController.createRoutes);
// Get All Routes
router.post("/all", checkPermission("route", "view"), validate(routeValidation.getRoutes), routeController.getRoutes); 
// Assign Routes to Rider
router.patch("/assign-to-riders/:vendorId", checkPermission("route", "assignRoutes"), validate(routeValidation.createAndAssigneRoutes), routeController.assignToRiders); 
// Get All Current week Orders with unassigned zone
router.get("/unassigned-zone-orders", checkPermission("route", "view"), routeController.unassignedZoneOrders);
// Assign Zone to Order
router.patch("/assign-zone-to-order", checkPermission("route", "create"), validate(routeValidation.assignZoneToOrder), routeController.assignZoneToOrder);
// Delete Routes By vendorId
router.delete("/delete-routes/:vendorId", checkPermission("route", "delete"), validate(routeValidation.deleteRoutes), routeController.deleteRoutes);

// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(checkPermission("route", "view"), validate(routeValidation.getRoute), routeController.getRoute)
  // .patch(checkPermission("route", "edit"), validate(routeValidation.updateRoute), routeController.updateRoute)


module.exports = router;