const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { customerService } = require('../services');

const importCustomers = catchAsync(async (req, res) => {
    const data = await customerService.importAndCompare(req.file);
    res.status(status.CREATED).send({ success: true, message: "Participants Imported Successfully", data});
});

const createCustomer = catchAsync(async (req, res) => {
    const customer = await customerService.createCustomer(req.body);
    res.status(status.CREATED).send({ success: true, message: "Participant Created Successfully", customer});
});
  
const getCustomers = catchAsync(async (req, res) => { 
    const customers = await customerService.queryCustomers(req.user, req.query.status);
    res.status(status.OK).send({ success: true, message: "Participants Fetched Successfully", customers});
});

const getPersCustomers = catchAsync(async (req, res) => { 
    const customers = await customerService.getPersCustomers(req.query.pers_status);
    res.status(status.OK).send({ success: true, message: "Pers Participants Fetched Successfully", customers});
});

const getCustomer = catchAsync(async (req, res) => {
    const customer = await customerService.getCustomerById(req.params.id);
    res.status(status.OK).send({ success: true, message: "Participant Fetched Successfully", customer});
});

const generateCredential = catchAsync(async (req, res) => {
    const data = await customerService.generateCredential(req.body.customerId);
    res.status(status.OK).send({ success: true, message: 'Credentials Generated and Participant Active Success', data});
});
  
const updateCustomer = catchAsync(async (req, res) => {
    const customer = await customerService.updateCustomerById(req.params.id, req.body);
    res.status(status.OK).send({ success: true, message: 'Participant Updated Success', customer});
});
  
const deleteCustomer = catchAsync(async (req, res) => {
    await customerService.deleteCustomerById(req.params.id);
    res.status(status.OK).send({ success: true, message: "Participant Deleted Success"});
});

const getAllPendingChanges = catchAsync(async (req, res) => {
    const pendingChanges = await customerService.getAllPendingChanges(req.user);
    res.status(status.OK).send({ success: true, message: "Pending Changes Fetched Successfully", pendingChanges});
});
  
const applyCustomerChanges = catchAsync(async (req, res) => {
    const updatedCustomer = await customerService.applyCustomerChanges(req.params.id);
    res.status(status.OK).send({ 
        success: true, 
        message: "Participant Changes Applied Successfully", 
        updatedCustomer
    });
});

const loggedInCustomerDetails = catchAsync(async (req, res) => {
    const user = await customerService.loggedInCustomerDetails(req.user);
    res.status(status.OK).send({ success: true, message: "LoggedIn Participant Details", user});
});

const updateCustomerPhoto = catchAsync(async (req, res) => {
    const user = await customerService.updateCustomerPhoto(req.user, req.file);
    res.status(status.OK).send({ success: true, message: 'Participant Updated Success', user});
});

const createRequest = catchAsync(async (req, res) => {
    const request = await customerService.createRequest(req.user, req.body);
    res.status(status.OK).send({ success: true, message: 'Participant Request Created', request });
});

const getAllRequests = catchAsync(async (req, res) => {
    const requests = await customerService.getAllRequests(req.user, req.query.status);
    res.status(status.OK).send({ success: true, message: "Participant Requests Fetched Successfully", requests });
});

const requestAction = catchAsync(async (req, res) => {
    const request = await customerService.requestAction(req.body);
    res.status(status.OK).send({ success: true, message: 'Participant Request Updated', request });
});
  
const updateCustomerStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const newStatus = req.body.status;

    const updatedCustomer = await customerService.updateCustomerStatus(id, newStatus);
    res.status(status.OK).send({
        success: true,
        message: 'Participant Status Updated Successfully',
        customer: updatedCustomer
    });
});
 
const bulkStatusUpdate = catchAsync(async (req, res) => {
    const updatedCustomers = await customerService.bulkStatusUpdate(req.body.ids, req.body.status);
    if (!updatedCustomers.success) {
        return res.status(status.BAD_REQUEST).send({ 
            success: false, 
            message: updatedCustomers.message, 
            customers: updatedCustomers.data 
        }); 
    }
    
    res.status(status.OK).send({ 
        success: true, 
        message: 'Bulk Status update successful', 
        updated_customers: updatedCustomers.data 
    });
});

module.exports = {
    importCustomers,
    createCustomer,
    getCustomers, 
    getPersCustomers,
    getCustomer,
    generateCredential,
    updateCustomer,
    deleteCustomer,
    getAllPendingChanges,
    applyCustomerChanges,
    loggedInCustomerDetails,
    updateCustomerPhoto,
    createRequest,
    getAllRequests,
    requestAction, 
    updateCustomerStatus,
    bulkStatusUpdate
};