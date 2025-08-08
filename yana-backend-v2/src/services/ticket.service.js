const { status } = require('http-status');
const mongoose = require("mongoose"); 
const ApiError = require('../utils/ApiError');
const { Ticket, Chat, Message, Customer, Admin, Organization, User, Role } = require('../models'); 
const generateUniqueId = require('../utils/generateUnique');
const { uploadToS3 } = require('./s3Bucket.service'); 
const { getIO, activeUsers } = require('../utils/socket/socket.js');
const { getVendorIdForUser, sendNotification } = require('../utils/helper.js');


const createTicket = async (currentUser, file, body) => { 
  body.ticket_id = await generateUniqueId("TKT");
  body.user = currentUser._id; 
  if (file) {
    const imageUrl = await uploadToS3(file, "ticket"); 
    body.image = imageUrl;
  }
  const ticket = await Ticket.create(body);
 
  const io = getIO();
  
  let newTicket =  await getTicketById(ticket._id);
  const ticketForEmit = newTicket.toObject ? newTicket.toObject() : newTicket;
  delete ticketForEmit.lastUpdated;
  ticketForEmit.unreadMessagesCount = 0;

  // Get all active users
  const activeUsersMap = activeUsers;
    
  // Emit to all admin users
  activeUsersMap.forEach((userInfo, userId) => {
    if (userInfo.organization === 'admin-organization') { 
      io.to(userId.toString()).emit("newTicketBroadcast", ticketForEmit);
    }
  }); 

  // Notify admins (non-blocking)
    (async () => {
      const vendorOfCustomer = await Admin.findById(currentUser.customer.vendorId).populate("user");
      if(!vendorOfCustomer) {
        return;
      }
      const adminOrg = await Organization.findOne({ name: 'admin-organization' }); 
      const orgUsers = await User.find({ organization: adminOrg._id }).select('_id role').lean();
      const roleIds = orgUsers.map(u => u.role);
  
      // Fetch roles with 'order' page and 'view' action permission
      const rolesWithOrderView = await Role.find({
        _id: { $in: roleIds },
        permissions: {
          $elemMatch: {
            page: 'ticket',
            actions: 'view'
          }
        }
      }).select('_id').lean();
      const allowedRoleIds = rolesWithOrderView.map(r => r._id.toString()); 
      // Filter users who have a matching allowed role
      const allowedUserIds = orgUsers
        .filter(u => allowedRoleIds.includes(u.role.toString()))
        .map(u => u._id);
      
      // Get admin users and their FCM tokens
      const adminUsers = await Admin.find({ user: { $in: allowedUserIds } }).select('fcm').lean();
      const adminFcmTokens = adminUsers.map(a => a.fcm).filter(Boolean); // remove nulls
  
      const adminTitle = "New ticket Received";
      const adminBody = `${currentUser.customer.name} send a new request.`;
      // Send FCM notification to all admins (in parallel)
      await Promise.all(
        adminFcmTokens.map(token =>
          sendNotification(adminTitle, adminBody, token, "")
        )
      ); 
    })().catch(console.error);
  
  return ticket;
};

const customerAllTickets = async (currentUser) => {
  const tickets = await Ticket.find({user: currentUser._id}).lean();
  
  const processedTickets = await Promise.all(tickets.map(async (ticket) => { 
      // Count unread messages
      const unreadMessagesCount = await Message.countDocuments({
        ticket: ticket._id,
        receiver: currentUser._id,
        isRead: false
      });
   
      return {
        ...ticket,
        unreadMessagesCount
      };
    }));
   
    return processedTickets.filter(Boolean).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

const allTickets = async (body) => {
  const { status, currentUser } = body;
  let query = {};
  let vendorId = await getVendorIdForUser(currentUser);

  if (!vendorId) {
    if (status !== 'all') query.status = status;
  } else {
    query.assignTo = currentUser._id;
    if (status !== 'all') {
      query.status = status;
    }
  } 

  const tickets = await Ticket.aggregate([
    {
      $match: query
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: false
      }
    },
    {
      $lookup: {
        from: "customers",
        let: { userId: "$user._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
          { $project: { customer_id: 1, vendorId: 1, name: 1, phone: 1, photo: 1, _id: 0 } }
        ],
        as: "customer"
      }
    },
    {
      $unwind: {
        path: "$customer",
        preserveNullAndEmptyArrays: false
      }
    }, 
    {
      $lookup: {
        from: "admins",
        localField: "customer.vendorId",
        foreignField: "_id",
        as: "customer.vendorId"
      }
    },
    {
      $unwind: {
        path: "$customer.vendorId",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "assignTo",
        foreignField: "_id",
        as: "assignTo"
      }
    },
    {
      $unwind: {
        path: "$assignTo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "admins",
        let: { userId: "$assignTo._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
          { $project: { name: 1, phone: 1, photo: 1, _id: 0 } }
        ],
        as: "assignTo_admin_user"
      }
    },
    {
      $unwind: {
        path: "$assignTo_admin_user",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "roles",
        let: { roleId: "$assignTo.role" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$roleId"] } } },
          { $project: { _id: 1, name: 1 } }
        ],
        as: "assignTo_role"
      }
    },
    {
      $unwind: {
        path: "$assignTo_role",
        preserveNullAndEmptyArrays: true
      }
    }, 
    {
      $addFields: {
        user: { $mergeObjects: ["$user", "$customer"] },
        assignTo: { $mergeObjects: ["$assignTo", "$assignTo_admin_user"] }
      }
    },
    {
      $addFields: { 
        assignTo: { $mergeObjects: ["$assignTo", { role: "$assignTo_role" }] }
      }
    },
    {
      $unset: [
        "user.role",
        "user.username",
        "user.password",
        "user.createdAt",
        "user.updatedAt",
        "assignTo.hierarchyLevel",
        "assignTo.hierarchyPath",
        "assignTo.createdBy", 
        "assignTo.username",
        "assignTo.password",
        "assignTo.createdAt",
        "assignTo.updatedAt", 
        "customer",
        "assignTo_admin_user",
        "assignTo_role"
      ]
    }
  ]);   

  const processedTickets = await Promise.all(tickets.map(async (ticket) => { 
      // Count unread messages
      const unreadMessagesCount = await Message.countDocuments({
        ticket: ticket._id,
        receiver: currentUser._id,
        sender: { $ne: currentUser._id }, 
        isRead: false
      });
 
      return {
        ...ticket,
        unreadMessagesCount
      };
  }));
   
  return processedTickets.filter(Boolean).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

const getTicketById = async (id) => { 
    const ticket = await Ticket.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "customers",
          let: { userId: "$user._id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
            { $project: { customer_id: 1, name: 1, phone: 1, photo: 1, _id: 0 } }
          ],
          as: "customer"
        }
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "assignTo",
          foreignField: "_id",
          as: "assignTo"
        }
      },
      {
        $unwind: {
          path: "$assignTo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "admins",
          let: { userId: "$assignTo._id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
            { $project: { name: 1, phone: 1, photo: 1, _id: 0 } }
          ],
          as: "assignTo_admin_user"
        }
      },
      {
        $unwind: {
          path: "$assignTo_admin_user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "roles",
          let: { roleId: "$assignTo.role" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$roleId"] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: "assignTo_role"
        }
      },
      {
        $unwind: {
          path: "$assignTo_role",
          preserveNullAndEmptyArrays: true
        }
      }, 
      {
        $addFields: {
          user: { $mergeObjects: ["$user", "$customer"] },
          assignTo: { $mergeObjects: ["$assignTo", "$assignTo_admin_user"] }
        }
      },
      {
        $addFields: { 
          assignTo: { $mergeObjects: ["$assignTo", { role: "$assignTo_role" }] }
        }
      },
      {
        $unset: [
          "user.role",
          "user.username",
          "user.password",
          "user.createdAt",
          "user.updatedAt",
          "assignTo.hierarchyLevel",
          "assignTo.hierarchyPath",
          "assignTo.createdBy", 
          "assignTo.username",
          "assignTo.password",
          "assignTo.createdAt",
          "assignTo.updatedAt", 
          "customer",
          "assignTo_admin_user",
          "assignTo_role"
        ]
      }
    ]);
  
    if (!ticket.length) {
      throw new ApiError(status.NOT_FOUND, 'Ticket not found');
    } 
    return ticket[0]; 
};

const updateTicketById = async (id, updateBody) => {
  const { assignTo, status } = updateBody;
  if (!assignTo && !status) {
    throw new ApiError(status.BAD_REQUEST, 'assignTo or status is required');
  }

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw new ApiError(status.NOT_FOUND, 'ticket not found');
  } 
 
  const updatedTicket = await Ticket.findByIdAndUpdate(
    id,
    { $set: updateBody },
    { new: true, runValidators: true }  
  );
  
  if(status && status == "solved"){
    await Message.updateMany(
      { ticket: ticket._id },
      { $set: { isRead: true } } 
    );

    // notify the user that the ticket is solved
    let customer = await Customer.findOne({ user: ticket.user }).lean();
    if (customer.fcm) {
      const title = "Your Ticket Has Been Solved!";
      let bodyText = "We are pleased to inform that your ticket has been resolved. If you still have any concerns, feel free to create a new ticket.";
      const fcmToken = customer.fcm;
      const imgURL = "";
      
      // Send notification
      await sendNotification(title, bodyText, fcmToken, imgURL); 
    }
  }
  
  if(updateBody.assignTo){  
    const assignToUser = await User.findById(updateBody.assignTo).select('_id role').lean();
      
    const rolesWithTaskView = await Role.findOne({
      _id: assignToUser.role,
      permissions: {
        $elemMatch: {
          page: 'ticket',
          actions: 'view'
        }
      }
    }).select('_id').lean(); 

    if(rolesWithTaskView) {
      const adminUser = await Admin.findOne({ user: assignToUser._id }).select('fcm').lean();
      if(adminUser && adminUser.fcm) {
        const adminTitle = "New Ticket Assigned";
        const adminBody = `Admin assigned a new ticket to you.`; 
        await sendNotification(adminTitle, adminBody, adminUser.fcm, "")
      }  
    } 
  }

  return await getTicketById(id);
};

const deleteTicketById = async (id) => {
    const ticket = await getTicketById(id);
    if (!ticket) {
      throw new ApiError(status.NOT_FOUND, 'ticket not found');
    }
    await ticket.remove();
    return ticket;
};

module.exports = {
    createTicket,
    customerAllTickets,
    allTickets,
    getTicketById,
    updateTicketById,
    deleteTicketById
};
