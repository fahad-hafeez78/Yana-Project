const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');

const createOrderAdmin = catchAsync(async (req, res) => {
    const order = await orderService.createOrderAdmin(req.body);
    res.status(status.CREATED).send({ success: true, message: "Order Created Success", order });
});

const createOrderApp = catchAsync(async (req, res) => {
    const order = await orderService.createOrderApp(req.user, req.body);
    res.status(status.CREATED).send({ success: true, message: "Order Created Success", order });
});
  
const getAllOrders = catchAsync(async (req, res) => { 
    const orders = await orderService.getAllOrders(req.user, req.query);
    res.status(status.OK).send({ success: true, orders });
});

const vendorMealsStats = catchAsync(async (req, res) => { 
    const stats = await orderService.vendorMealsStats(req.params.vendorId, req.params.status);
    res.status(status.OK).send({ success: true, stats });
});

const customerAllOrders = catchAsync(async (req, res) => { 
    const orders = await orderService.customerAllOrders(req.user);
    res.status(status.OK).send({ success: true, orders });
});
  
const getOrderById = catchAsync(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);
    res.status(status.OK).send({ success: true, order });
});

const trackOrder = catchAsync(async (req, res) => {
    const order = await orderService.trackOrder(req.user);
    res.status(status.OK).send({ success: true, order });
});

const updateOrderStatusToComplete = catchAsync(async (req, res) => {
    const order = await orderService.updateOrderStatusToComplete(req.params.id);
    res.status(status.OK).send({ success: true, message: 'Order Status Updated Success', order });
});
  
const updateOrder = catchAsync(async (req, res) => {
    const order = await orderService.updateOrderById(req.params.id, req.body);
    res.status(status.OK).send({ success: true, message: 'Order Updated Success', order });
});

const customerUpdateOrder = catchAsync(async (req, res) => {
    const order = await orderService.customerUpdateOrderById(req.user, req.params.id, req.body);
    res.status(status.OK).send({ success: true, message: 'Order Updated Success', order });
});

const softDeleteOrder = catchAsync(async (req, res) => {
    await orderService.softDeleteOrder(req.params.id);
    res.status(status.OK).send({ success: true, message: "Order moved to trash" });
});

const getSoftDeletedOrders = catchAsync(async (req, res) => { 
    const orders = await orderService.getSoftDeletedOrders(req.user);
    res.status(status.OK).send({ success: true, orders });
});
  
const deleteOrder = catchAsync(async (req, res) => {
    await orderService.deleteOrderById(req.params.id, req.user);
    res.status(status.OK).send({ success: true, message: "Order Deleted Success" });
});
 
const getOrderPlacingDuration = catchAsync(async (req, res) => { 
    const duration = await orderService.getOrderPlacingDuration();
    res.status(status.OK).send({ success: true, duration });
});

const updateOrderPlacingDuration = catchAsync(async (req, res) => {
    const duration = await orderService.updateOrderPlacingDuration(req.body);
    res.status(status.OK).send({ success: true, message: 'Duration Updated Success', duration });
});

const bulkStatusUpdate = catchAsync(async (req, res) => {
    const updatedOrder = await orderService.bulkStatusUpdate(req.body.ids, req.body.status);
    if (!updatedOrder.success) {
        return res.status(status.BAD_REQUEST).send({ success: false, message: updatedOrder.message, updated_orders: updatedOrder.data });
    }
    res.status(status.OK).send({ success: true, message: 'Bulk Status update successful', updated_orders: updatedOrder.data });
});

const getLatestOrdersByCustomerId = catchAsync(async (req, res) => {
    const orders = await orderService.getLatestOrdersByCustomerId(req.params.customerId);
    res.status(status.OK).send({ success: true, orders });
});


module.exports = {
    createOrderAdmin,
    createOrderApp,
    getAllOrders, 
    vendorMealsStats,
    customerAllOrders,
    getOrderById,
    trackOrder,
    updateOrderStatusToComplete,
    updateOrder,
    customerUpdateOrder,
    softDeleteOrder,
    getSoftDeletedOrders,
    deleteOrder,
    getOrderPlacingDuration,
    updateOrderPlacingDuration,
    bulkStatusUpdate, 
    getLatestOrdersByCustomerId
}; 
