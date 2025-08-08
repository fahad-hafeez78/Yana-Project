const { Server } = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');  
const moment = require("moment-timezone");
const config = require('../../config/config');
const { User, Chat, Message, Ticket, Rider, Route, Order, Admin, Customer } = require('../../models'); 
const { uploadToS3 } = require('../../services/s3Bucket.service');
const { getAllChatsOfUser, getAllChatsOfRider, getChatUsers } = require('../../services/chat.service'); 
const { convertToUniversalAudio, sendNotification } = require('../helper');
let io;
 
const activeUsers = new Map();

const initializeSocket = (server) => { 

  io = new Server(server, {
    cors: {
      origin: [
        'https://beta.physicianmarketing.us',
        'http://localhost:5173',
        'http://192.168.18.7:3001',
        'http://192.168.1.46:3001',
        'http://192.168.18.105:3000',
        'http://192.168.10.71:3000', 
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: 1e7, // 10 MB
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      const decoded = jwt.verify(token, config.jwt.access_token_secret);
      let user_id = decoded.sub; 
      const user = await User.findById(user_id).select("-password").populate("role").populate("organization").lean();
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', async (socket) => {    
    const userId = socket.user._id.toString(); 
    if (userId) {
      socket.join(userId);
      
      activeUsers.set(userId, { userId, socketId: socket.id, role: socket.user.role.name, organization: socket.user?.organization?.name || undefined });

      console.log(`🟢 User connected: ${userId} (${socket.user.role.name})`); 
      console.log(`Active users: ${Array.from(activeUsers.keys())}`);
      // Broadcast current active users to all
      io.emit('activeUsers', Array.from(activeUsers.values()));
    }
  
    // =======================
    // Get All Chats
    // =======================
    socket.on('allChats', async (body) => {
      try {
        const { role } = body;
        const currentUser = await User.findById(userId).select("-password").populate("role");
        let chats = [];
        if (currentUser.role.name === 'rider') {
          chats = await getAllChatsOfRider(currentUser);
        } else {
          chats = await getAllChatsOfUser(currentUser, role); 
        }
        socket.emit('allChats', chats);
      } catch (error) {
        console.error('Error fetching all chats:', error);
        socket.emit('error', { message: error.message || 'Failed to fetch chats' });
      }
    });
 
    // =======================
    // User-to-user messaging
    // =======================
    socket.on('sendMessage', async (body) => {
        try { 
          const { chatId, receiverId, text, messageType, file, mimeType, fileName } = body;
        
          if (!text && !file) return socket.emit("error", { message: "Empty message." });
          
          let chat; 
          if (chatId) {
            chat = await Chat.findById(chatId);
          } 
          // If chat doesn't exist or chatId not sent
          if (!chat) {
            let users = await User.find({ _id: { $in: [userId, receiverId] } }).populate("role");
            if (users.length !== [userId, receiverId].length) {
              return socket.emit("error", { message: "Invalid user Ids provided." }); 
            }
          
            if (users[0].role.name == "customer" || users[1].role.name == "customer") {
              return socket.emit("error", { message: "Customer user not allowed." });  
            } 
            
            chat = await Chat.findOne({
              members: { $all: [userId, receiverId], $size: 2 }
            });
            
            if (!chat) {
              chat = await Chat.create({ members: [userId, receiverId] });
            }
          }

          if (!chat) {
            console.error('Chat could not be created');
            return socket.emit("error", { message: "Unable to create chat." });
          }
          
          let mediaUrl = null; 
          if (messageType == 'audio' && file) {
            const FileType = require('file-type'); 
            let fileBuffer = Buffer.isBuffer(file) ? file : Buffer.from(file.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
            // Use the new universal audio converter 
            const { buffer: mp3Buffer, mimetype, extension } = await convertToUniversalAudio(fileBuffer, mimeType, 'chat_audio', fileName);
            const randomName = Math.random().toString(36).substring(2, 12);
            const fallbackFileName = `${randomName}.${extension}`;
            let file_details = {
              originalname: fallbackFileName,
              mimetype,
              buffer: mp3Buffer,
            };

            mediaUrl = await uploadToS3(file_details, 'chatMedia');
          } else if (messageType !== 'text' && file) {      
            const FileType = require('file-type'); 
            let fileBuffer = file; 
            if (Buffer.isBuffer(file)) {
              fileBuffer = file; 
            } else if (typeof file === 'string') { 
              const base64Data = file.replace(/^data:audio\/\w+;base64,/, '');
              fileBuffer = Buffer.from(base64Data, 'base64');
            }
    
            // Auto-detect type if not passed
            const type = mimeType && fileName ? { mime: mimeType, ext: fileName.split('.').pop() } : await FileType.fromBuffer(fileBuffer);
            if (!type) {
              return socket.emit('error', { message: 'Unsupported or unknown file type' });
            }  

            const randomName = Math.random().toString(36).substring(2, 12); // 10-char random
            const fallbackFileName = `${randomName}.${type.ext}`;

              let file_details = {
                originalname: fileName || fallbackFileName,
                mimetype: type.mime,
                buffer: fileBuffer,
              }
              mediaUrl = await uploadToS3(file_details, "chatMedia");
          } 

          // Save message
          const message = await Message.create({
              chat: chat._id,
              sender: userId,
              receiver: receiverId,
              text,
              messageType,
              mediaUrl,
          });
          
          // Update chat
          await Chat.findByIdAndUpdate(chat._id, {
              lastMessage: message._id,
              lastUpdated: moment().tz("America/New_York")
          });
  
          const msgPayload = message.toObject();
          socket.emit('newMessage', msgPayload);   
          io.to(receiverId.toString()).emit('newMessage', msgPayload);
          let data = await unreadChatsAndMessages(receiverId); 
          io.to(receiverId.toString()).emit('unread-chats-and-messages', data);

          // Push notification logic here
          let receiverFcm = null;
          // const admin = await Admin.findOne({ user: receiverId }).select('fcm');
          // if (admin && admin.fcm) receiverFcm = admin.fcm; 
          if (!receiverFcm) {
            const rider = await Rider.findOne({ user: receiverId }).select('fcm');
            if (rider && rider.fcm) receiverFcm = rider.fcm;
          }
          if (receiverFcm) {
            const title = "New Chat Message";
            const bodyText = "You have received a new message.";
            const imgURL = null;
            await sendNotification(title, bodyText, receiverFcm, imgURL);
          }
        } catch (error) {
          console.error('Error sending message:', error.message);
          console.error('Error:', error);
          return socket.emit('error', { message: error.message || 'Failed to send message' });
        }
    });

    // =======================
    // Get Rider Chat Users
    // =======================
    socket.on('rider-chat-users', async () => {
      try { 
        const currentUser = await User.findById(userId).select("-password").populate("role"); 
        if (currentUser.role.name !== 'rider') {
          return socket.emit('error', { message: 'rider not found' });
        }
        
        let users = await getChatUsers(currentUser);
        io.to(userId.toString()).emit('rider-chat-users', users);
      } catch (error) {
        console.error('Error fetching all chat users:', error);
        socket.emit('error', { message: error.message || 'Failed to fetch chat users' });
      }
    });

    // ========================
    // Unread Chats And Messages
    // ========================
    socket.on('unread-chats-and-messages', async () => {  
      try {
        let data = await unreadChatsAndMessages(userId); 
        socket.emit('unread-chats-and-messages', data);
      } catch (error) {
        console.error('Error clearing unread messages:', error.message);
        return socket.emit('error', { message: error.message || 'Fail to clear unread chats' });
      }
    });
 
    // =================================
    // Clear unread chat messages counts
    // ================================
    socket.on('clear-unread-chat-messages-count', async ({ chatId }) => {
      try {
        await Message.updateMany(
          { chat: chatId, receiver: userId, isRead: false },
          { $set: { isRead: true } }
        ); 
        let data = await unreadChatsAndMessages(userId); 
        io.to(userId.toString()).emit('unread-chats-and-messages', data);
      } catch (err) {
        console.error('Error clearing unread messages:', err.message);
        return socket.emit('error', { message: err.message || 'Fail to clear unread chats' });
      }
    }); 

    // =======================
    // Get All Tickets
    // =======================
    socket.on('allTickets', async (body) => { 
      try {
        const { customerAllTickets, allTickets } = require('../../services/ticket.service');
        const currentUser = await User.findById(userId).select("-password").populate("role");
        let tickets = []; 
        if(currentUser.role.name == 'customer'){
          tickets = await customerAllTickets(currentUser); 
        } else {
          body.currentUser = currentUser;
          tickets = await allTickets(body); 
        }
        socket.emit('allTickets', tickets);
      } catch (error) {
        console.error('Error all ticket fetch: ', error.message);
        return socket.emit('error', { message: error.message || 'Failed to fetch tickets' });
      }
    });
 
    // =================================
    // Send message in ticket-based chat
    // =================================
    socket.on('sendTicketMessage', async (body) => {
      try {
        const { ticketId, text, messageType, file, mimeType, fileName } = body;
        const ticket = await Ticket.findById(ticketId).populate('user assignTo');
        if (!ticket) return;

        if (!text && !file) return socket.emit("error", { message: "Empty message." });
        if (!ticket.user || !ticket.user._id) return socket.emit('error', { message: 'Ticket user not found.' });
        if (!ticket.assignTo || !ticket.assignTo._id) return socket.emit('error', { message: 'Ticket is unassigned.' });
        const currentUser = await User.findById(userId).select("-password").populate("role"); 
        if (currentUser.role.name !== 'customer' && String(ticket.assignTo._id) !== userId) return socket.emit('error', { message: 'Ticket not assigned to you.' });
        
        if (ticket.status === 'solved') {
          socket.emit('error', { message: 'Ticket is solved. You cannot send message.' });
          return;
        }
    
        let mediaUrl = null; 
        if (messageType == 'audio' && file) { 
          let fileBuffer = Buffer.isBuffer(file) ? file : Buffer.from(file.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
          // Use the new universal audio converter 
          const { buffer: mp3Buffer, mimetype, extension } = await convertToUniversalAudio(fileBuffer, mimeType, 'chat_audio', fileName);
          const randomName = Math.random().toString(36).substring(2, 12);
          const fallbackFileName = `${randomName}.${extension}`;
          let file_details = {
            originalname: fallbackFileName,
            mimetype,
            buffer: mp3Buffer,
          }; 

          mediaUrl = await uploadToS3(file_details, 'ticketMedia'); 
        } else if(messageType !== 'text' && file) {      
          const FileType = require('file-type'); 
          let fileBuffer = file; 
          if (Buffer.isBuffer(file)) {
            fileBuffer = file; 
          } else if (typeof file === 'string') { 
            const base64Data = file.replace(/^data:audio\/\w+;base64,/, '');
            fileBuffer = Buffer.from(base64Data, 'base64');
          }
  
          // Auto-detect type if not passed
          const type = mimeType && fileName ? { mime: mimeType, ext: fileName.split('.').pop() } : await FileType.fromBuffer(fileBuffer);
          if (!type) {
            return socket.emit('error', { message: 'Unsupported or unknown file type' });
          }
    
          const randomName = Math.random().toString(36).substring(2, 12); // 10-char random
          const fallbackFileName = `${randomName}.${type.ext}`;

            let file_details = {
              originalname: fileName || fallbackFileName,
              mimetype: type.mime,
              buffer: fileBuffer,
            }
            mediaUrl = await uploadToS3(file_details, 'ticketMedia');
        }  

        const receiverId = String(ticket.user._id) === userId
          ? ticket.assignTo._id
          : ticket.user._id;

        const message = await Message.create({ 
          sender: userId,
          receiver: receiverId,
          ticket: ticketId,
          text,
          messageType,
          mediaUrl,
        });

        // Update ticket
        await Ticket.findByIdAndUpdate(ticket._id, { 
          lastUpdated: moment().tz("America/New_York")
        });
    
        const msgPayload = message.toObject();
        socket.emit('newTicketMessage', msgPayload);   
        io.to(receiverId.toString()).emit('newTicketMessage', msgPayload);

        // Push notification logic here
        let receiverFcm = null; 
        if (!receiverFcm) {
          const customer = await Customer.findOne({ user: receiverId }).select('fcm');
          if (customer && customer.fcm) receiverFcm = customer.fcm;
        }
        if (receiverFcm) {
          const title = "New Chat Message";
          const bodyText = "You have received a new message.";
          const imgURL = null;
          await sendNotification(title, bodyText, receiverFcm, imgURL);
        }
      } catch (error) {
        console.error('Error all ticket fetch: ', error.message);
        return socket.emit('error', { message: error.message || 'Failed to send ticket message' });
      } 
    });

    // ===========================
    // Unread Tickets And Messages
    // ===========================
    socket.on('unread-tickets-and-messages', async () => {  
      let data = await unreadTicketsAndMessages(userId); 
      socket.emit('unread-tickets-and-messages', data);
    });

    // ==================================
    // Clear unread ticket messages counts
    // ==================================
    socket.on('clear-unread-ticket-messages-count', async ({ ticketId }) => {
      try {
        await Message.updateMany(
          { ticket: ticketId, receiver: userId, isRead: false },
          { $set: { isRead: true } }
        ); 
      } catch (error) {
        console.error('Error clearing unread messages:', error.message);
        return socket.emit('error', { message: error.message || 'Failed to fetch tickets' });
      }
    }); 
 
    // ==============================
    // Typing indicators
    // ==============================
    socket.on('typing', ({ to }) => {
      if(!to) {
        return socket.emit("error", { message: "Receiver id is required." });
      }
      socket.to(to.toString()).emit('typing', { from: userId });
    });
  
    socket.on('stopTyping', ({ to }) => {
      if(!to) {
        return socket.emit("error", { message: "Receiver id is required." });
      }
      socket.to(to.toString()).emit('stopTyping', { from: userId });
    });


    // ==============================
    // Tracking Routes Module
    // ==============================
    // ==============================
    // Rider Start Route
    // ==============================
    socket.on('riderStartRoute', ({ riderId, routeId }) => { 

      if (socket.user.role.name !== 'rider') {
        return socket.emit('error', { message: 'Only riders can start a route' });
      }

      if (socket.user._id.toString() !== riderId) {
        return socket.emit('error', { message: 'Invalid riderId' });
      }

      if (!routeId) {
        return socket.emit('error', { message: 'routeId is required' });
      }

      const riderRoom = `riderTracking-${riderId}`;
      const routeRoom = `routeTracking-${routeId}`;

      socket.join(riderRoom);
      socket.join(routeRoom); 
 
    });

    // ==============================
    // Rider's Live Coordinates
    // ==============================
    socket.on("riderLiveLocation", async ({ riderId, routeId, location }) => {
      try { 

        if (!routeId) {
          return socket.emit('error', { message: 'routeId is required' });
        }

        // Authentication & Validation
        if (socket.user.role.name !== 'rider' || socket.user._id.toString() !== riderId) {
          return socket.emit('error', { message: 'Unauthorized location update' });
        }

        if (!location || location.length !== 2) {
          return socket.emit('error', { message: 'Invalid location data' });
        } 

        // const riderRoom = `riderTracking-${riderId}`; 
        io.to(`routeTracking-${routeId}`).emit("riderLiveLocation", {
          riderId, 
          routeId, 
          location, 
          timestamp: moment().tz("America/New_York") 
        }); 

        // Also emit to all customer rooms for orders in this route
        const route = await Route.findById(routeId).populate('stops.order').lean();
        if (route && route.stops) {
          route.stops.forEach(stop => {
            if (stop.order && stop.status === 'pending') {
              const orderRoom = `customerOrderTracking-${stop.order._id.toString()}`;
              io.to(orderRoom).emit('customerRiderLiveLocation', {
                orderId: stop.order._id,
                location,
                routeId,
                timestamp: moment().tz("America/New_York")
              });
            }
          });
        }

      } catch (error) {
        console.error("Error in riderLiveLocation: ", error);
        socket.emit('error', { message: 'Failed to fetch rider live location' });
      }
    });
     
    // ====================================================
    // Any User subscribe to track a route 
    // ====================================================
    socket.on('subscribeRouteAndRiderTracking', ({ routeId, riderId }) => {
      if (!routeId || !riderId) {
        socket.emit('error', { message: 'routeId and riderId are required' });
        return;
      }

      const riderRoomName = `riderTracking-${riderId}`;
      socket.join(riderRoomName);

      const routeRoomName = `routeTracking-${routeId}`;
      socket.join(routeRoomName); 
    });

    // ====================================================
    // Any User unsubscribe to track a route 
    // ====================================================
    socket.on('unsubscribeRouteAndRiderTracking', ({ routeId, riderId }) => {
      if (!routeId || !riderId) {
        socket.emit('error', { message: 'routeId and riderId are required' });
        return;
      }

      const riderRoomName = `riderTracking-${riderId}`;
      socket.leave(riderRoomName);

      const routeRoomName = `routeTracking-${routeId}`;
      socket.leave(routeRoomName); 
    });

    // ====================================================
    // Customer Order Tracking Module
    // ====================================================
    // ==============================
    // Customer subscribe to track their order
    // ==============================
    socket.on('customerSubscribeOrderTracking', async ({ customerId, orderId }) => {
      try {
        
        // Only customers can subscribe to order tracking
        if (socket.user.role.name !== 'customer') {
          return socket.emit('error', { message: 'Only customers can track orders' });
        } 

        if (!orderId || !customerId) {
          return socket.emit('error', { message: 'customerId and orderId required' });
        }
        
        // Check if the order belongs to this customer
        const customerOrder = await Order.findOne({
          _id: orderId,
          customer: customerId,
          status: 'on the way'
        }).lean();

        if (!customerOrder) {
          return socket.emit('error', { message: 'Order not found or does not belong to you' });
        }

        // Join the order tracking room
        const orderRoom = `customerOrderTracking-${orderId}`;
        socket.join(orderRoom); 

        console.log(`🟢 Customer ${customerId} subscribed to order tracking: ${orderId}`);

      } catch (error) {
        console.error('Error in customerSubscribeOrderTracking:', error);
        socket.emit('error', { message: error.message || 'Failed to subscribe to order tracking' });
      }
    });

    // ==============================
    // Customer unsubscribe from order tracking
    // ==============================
    socket.on('customerUnsubscribeOrderTracking', ({ customerId, orderId }) => {
       
      if (socket.user.role.name !== 'customer') {
        return socket.emit('error', { message: 'Only customers can unsubscribe from order tracking' });
      }

      if (!orderId || !customerId) {
        return socket.emit('error', { message: 'customerId and orderId required' });
      }

      const orderRoom = `customerOrderTracking-${orderId}`;
      socket.leave(orderRoom); 

      console.log(`🔴 Customer ${customerId} unsubscribed from order tracking: ${orderId}`);
    });
  
      
    // ==============================
    // Disconnect cleanup
    // ==============================
    socket.on('disconnect', () => {
      const removedUserId = activeUsers.get(userId);
      if (removedUserId) { 
        activeUsers.delete(userId);
        console.log(`🔴 User disconnected: ${userId} (${socket.user.role.name})`);
        console.log(`Active users: ${Array.from(activeUsers.keys())}`);
        io.emit('activeUsers', Array.from(activeUsers.values()));
      }
    });
  });
};

// unread chats and messages
const unreadChatsAndMessages = async (userId) => {
    try { 
      const unreadByChat = await Message.aggregate([
        { $match: { receiver: new mongoose.Types.ObjectId(userId), isRead: false } },
        { $group: { _id: '$chat', count: { $sum: 1 } } },
      ]);
  
      // const unreadMessages = await Message.countDocuments({
      //   receiver: userId,
      //   isRead: false,
      // });
  
      return {
        unreadChats: unreadByChat.length, 
        // unreadByChat: unreadByChat.reduce((acc, item) => {
        //   acc[item._id] = item.count;
        //   return acc;
        // }, {})
      }
    } catch (err) {
      console.error('Error sending unread count:', err.message);
    }
};

// unread tickets and messages
const unreadTicketsAndMessages = async (userId) => {
  try { 
    const unreadByTicket = await Message.aggregate([
      { $match: { receiver: new mongoose.Types.ObjectId(userId), isRead: false } },
      { $group: { _id: '$ticket', count: { $sum: 1 } } },
    ]);

    // const unreadMessages = await Message.countDocuments({
    //   receiver: userId,
    //   isRead: false,
    // });

    return {
      unreadTickets: unreadByTicket.length, 
      unreadByTicket: unreadByTicket.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    }
  } catch (err) {
    console.error('Error sending unread count:', err.message);
  }
};
 
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
  activeUsers
};
