const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { routeService } = require('../services');

const createRoutes = catchAsync(async (req, res) => {
    const routes = await routeService.createRoutesWithoutZones(req.params);
    res.status(status.CREATED).send({ success: true, message: "Route Created Success", routes});
});
  
const getRoutes = catchAsync(async (req, res) => { 
    const routes = await routeService.queryRoutes(req.user, req.body);
    res.status(status.OK).send({ success: true, routes });
});

const assignToRiders = catchAsync(async (req, res) => {
    const routes = await routeService.assignToRiders(req.params);
    res.status(status.OK).send({ success: true, message: "Routes Assigned to Riders Success", routes });
});

const unassignedZoneOrders = catchAsync(async (req, res) => { 
    const orders = await routeService.unassignedZoneOrders(req.user);
    res.status(status.OK).send({ success: true, orders });
});

const assignZoneToOrder = catchAsync(async (req, res) => { 
    const order = await routeService.assignZoneToOrder(req.body);
    res.status(status.OK).send({ success: true, message: "Zone Assigned to Order Success" });
});

const getRoute = catchAsync(async (req, res) => {
    const route = await routeService.getRouteById(req.params.id);
    res.status(status.OK).send({ success: true, route });
});

const getRiderNewRoute = catchAsync(async (req, res) => {
    const route = await routeService.getRiderNewRoute(req.user);
    res.status(status.OK).send({ success: true, route });
});

const getCustomerNewRoute = catchAsync(async (req, res) => {
    const route = await routeService.getCustomerNewRoute(req.user);
    res.status(status.OK).send({ success: true, route });
});
 
const getAllRoutesOfRider = catchAsync(async (req, res) => {
    const routes = await routeService.getAllRoutesOfRider(req.user);
    res.status(status.OK).send({ success: true, routes });
});
  
const updateRoute = catchAsync(async (req, res) => {
    const route = await routeService.updateRouteById(req.params.id, req.body);
    res.status(status.OK).send({ success: true, message: 'Route Updated Success', route });
});

const updateRouteStatus = catchAsync(async (req, res) => {
    const route = await routeService.updateRouteStatus(req.body);
    res.status(status.OK).send({ success: true, message: 'Route status updated success', route });
});

const updateOrderStatus = catchAsync(async (req, res) => {
    const route = await routeService.updateOrderStatus(req.user, req.file, req.body);
    res.status(status.OK).send({ success: true, message: 'Order marked as delivered, Great efforts', route });
});

const nextDestination = catchAsync(async (req, res) => {
    const notifi = await routeService.nextDestination(req.body); 
    res.status(status.OK).send({ success: true, message: 'Next Destination Selected' });
});
 
const deleteRoutes = catchAsync(async (req, res) => {
    await routeService.deleteRoutesByVendorId(req.params.vendorId);
    res.status(status.OK).send({ success: true, message: "Route Deleted Success" });
});


module.exports = {
    createRoutes,
    getRoutes, 
    assignToRiders,
    unassignedZoneOrders,
    assignZoneToOrder,
    getRoute,
    getRiderNewRoute,
    getCustomerNewRoute,
    getAllRoutesOfRider,
    updateRoute,
    updateRouteStatus,
    updateOrderStatus, 
    nextDestination,
    deleteRoutes
}; 
