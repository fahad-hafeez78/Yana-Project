const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { ticketService } = require('../services');

const createTicket = catchAsync(async (req, res) => {
    const ticket = await ticketService.createTicket(req.user, req.file, req.body);
    res.status(status.CREATED).send({ success: true, message: "Ticket Created Success", ticket});
});

const customerAllTickets = catchAsync(async (req, res) => { 
    const tickets = await ticketService.customerAllTickets(req.user);
    res.status(status.OK).send({ success: true, tickets });
});
  
const allTickets = catchAsync(async (req, res) => { 
    const tickets = await ticketService.allTickets(req.query);
    res.status(status.OK).send({ success: true, tickets });
});

const getTicket = catchAsync(async (req, res) => {
    const ticket = await ticketService.getTicketById(req.params.id);
    res.status(status.OK).send({ success: true, ticket });
});
  
const updateTicket = catchAsync(async (req, res) => {
    const ticket = await ticketService.updateTicketById(req.params.id, req.body);
    res.status(status.OK).send({ success: true, message: 'Ticket Updated Success', ticket });
});
  
const deleteTicket = catchAsync(async (req, res) => {
    await ticketService.deleteTicketById(req.params.id);
    res.status(status.OK).send({ success: true, message: "Ticket Deleted Success" });
});


module.exports = {
    createTicket,
    customerAllTickets,
    allTickets, 
    getTicket,
    updateTicket,
    deleteTicket
}; 
