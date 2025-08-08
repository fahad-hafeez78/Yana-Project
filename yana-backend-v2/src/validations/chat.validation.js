const Joi = require('joi');
const { password, objectId } = require('./custom.validation'); 


const createChat = {  
    body: Joi.object().keys({
      members: Joi.array()
        .items(Joi.string().custom(objectId))
        .length(2)
        .required()
        .custom((value, helpers) => {
          if (value[0] === value[1]) {
            return helpers.error("any.invalid");
          }
          return value;
        }, "Members must be unique"),
    }),
};  

const getAllChatsOfUser = {  
    body: Joi.object().keys({
        role: Joi.string().required()
    }),
};

const getAllMessagesByChatId = {  
    params: Joi.object().keys({
        chatId: Joi.string().required().custom(objectId),
    }),
};

const messagesByTicketId = {  
    params: Joi.object().keys({
        ticketId: Joi.string().required().custom(objectId),
    }),
};

  
module.exports = { 
    createChat,
    getAllChatsOfUser,
    getAllMessagesByChatId,
    messagesByTicketId  
};