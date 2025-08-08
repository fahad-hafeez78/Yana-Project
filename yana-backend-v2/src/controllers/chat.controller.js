const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { chatService } = require('../services');
 

const createChat = catchAsync(async (req, res) => { 
    const chat = await chatService.createChat(req.body);
    res.status(status.CREATED).send({ success: true, message:"Chat Created Successfully.", chat });
});
  
const getAllChatsOfUser = catchAsync(async (req, res) => { 
    const chats = await chatService.getAllChatsOfUser(req.user, req.body.role);
    res.status(status.OK).send({ success: true, message:"Chats Fetched Successfully.", chats });
});

const getAllMessagesByChatId = catchAsync(async (req, res) => { 
    const messages = await chatService.getAllMessagesByChatId(req.params.chatId);
    res.status(status.OK).send({ success: true, message:"Messages Fetched Successfully.", messages });
});
 
const messagesByTicketId = catchAsync(async (req, res) => { 
    const messages = await chatService.messagesByTicketId(req.params.ticketId);
    res.status(status.OK).send({ success: true, message:"Messages Fetched Successfully.", messages });
});

const getChatUsers = catchAsync(async (req, res) => {
    const users = await chatService.getChatUsers(req.user);
    res.status(status.OK).send({ success: true, message: "Users Fetched Successfully", users });
});
 

module.exports = { 
    createChat,
    getAllChatsOfUser,
    getAllMessagesByChatId,
    messagesByTicketId,
    getChatUsers 
}; 
