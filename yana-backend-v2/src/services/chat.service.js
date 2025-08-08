const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
const { User, Chat, Message, Admin, Customer, Rider } = require('../models'); 


const createChat = async (body) => { 
  const { members } = body;
  let users = await User.find({ _id: { $in: members } }).populate("role");
  if (users.length !== members.length) {
    throw new ApiError(status.BAD_REQUEST, "Invalid user IDs provided.");
  }

  if (users[0].role.name == "customer" || users[1].role.name == "customer") {
    throw new ApiError(status.BAD_REQUEST, "User role should not be customer.");
  }

  let chat = await Chat.findOne({ members: { $all: [members[0], members[1]] } });
  if (!chat) {
    chat = await Chat.create({ members: members });
  } 
  
  return chat;
};
 
const getAllChatsOfUser = async (currentUser, role) => {
  // Step 1: Get all chats where the current user is a member
  const chats = await Chat.find({ members: currentUser._id })
    .populate({
      path: "members",
      select: "role email",
      populate: {
        path: "role",
        select: "name"
      }
    }).populate("lastMessage").lean();

  const processedChats = await Promise.all(chats.map(async (chat) => {
    // Step 2: Filter out the current user and get the other member
    const otherMember = chat.members.find(member => !member._id.equals(currentUser._id));

    if (!otherMember) return null;  // If no other member, return null

    // Step 3: Apply role-based filter (if necessary)
    if (role !== 'all' && otherMember.role?.name !== role) {
      return null;
    }

    // Step 4: Efficiently query for Admin for the profile data
    let profile;
    if(otherMember.role?.name == 'rider') {
      profile = await Rider.findOne({ user: otherMember._id }).select("name photo").lean();
    } else {
      profile = await Admin.findOne({ user: otherMember._id }).select("name photo").lean();
    }
    if (!profile) {
      return null;
    }

    // Merge profile data
    const memberData = {
      ...otherMember,
      profile
    };

    // Step 5: Count unread messages
    const unreadMessagesCount = await Message.countDocuments({
      chat: chat._id,
      receiver: currentUser._id,
      sender: { $ne: currentUser._id }, 
      isRead: false
    });

    // Return the processed chat data
    return {
      _id: chat._id,
      member: memberData,
      lastMessage: chat.lastMessage,
      unreadMessagesCount,
      updatedAt: chat.updatedAt,
      createdAt: chat.createdAt
    };
  }));

  // Step 6: Remove null results and sort by `updatedAt`
  return processedChats.filter(Boolean).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

const getAllChatsOfRider = async (currentUser) => {
  // Step 1: Get all chats where the current user is a member
  const chats = await Chat.find({ members: currentUser._id })
    .populate({
      path: "members",
      select: "role email",
      populate: {
        path: "role",
        select: "name"
      }
    }).populate("lastMessage").lean();

  const processedChats = await Promise.all(chats.map(async (chat) => {
    // Step 2: Filter out the current user and get the other member
    const otherMember = chat.members.find(member => !member._id.equals(currentUser._id));

    if (!otherMember) return null;  // If no other member, return null
 
    // Step 3: Efficiently query for Admin for the profile data
    let profile = await Admin.findOne({ user: otherMember._id }).select("name photo").lean();
    if (!profile) {
      return null;
    }

    // Merge profile data
    const memberData = {
      ...otherMember,
      profile
    };

    // Step 4: Count unread messages
    const unreadMessagesCount = await Message.countDocuments({
      chat: chat._id,
      receiver: currentUser._id,
      sender: { $ne: currentUser._id }, 
      isRead: false
    });

    // Return the processed chat data
    return {
      _id: chat._id,
      member: memberData,
      lastMessage: chat.lastMessage,
      unreadMessagesCount,
      updatedAt: chat.updatedAt,
      createdAt: chat.createdAt
    };
  }));

  // Step 5: Remove null results and sort by `updatedAt`
  return processedChats.filter(Boolean).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};


const getAllMessagesByChatId = async (chatId) => { 
  const messages = await Message.find({ chat: chatId });  
  return messages; 
};

const messagesByTicketId = async (ticketId) => { 
  const messages = await Message.find({ ticket: ticketId });  
  return messages; 
};

const getChatUsers = async (currentUser) => { 
  if (!currentUser) {
    throw new ApiError(status.NOT_FOUND, 'user not found');
  }
  let rider = await Rider.findOne({user: currentUser._id });
  if (!rider) {
    throw new ApiError(status.NOT_FOUND, 'Rider not found');
  }
  let vendor = await Admin.findById(rider.vendorId).populate("user", "email").lean();
  if (!vendor) {
    throw new ApiError(status.NOT_FOUND, 'vendor not found');
  }
  if (vendor.status !== 'active') {
    throw new ApiError(status.NOT_FOUND, 'vendor is not active');
  }

  // fetch admin users created by the vendor  
  let users = await User.find({ createdBy: vendor.user._id }).lean();

  // fetch admin users of above users
  let adminUsers = await Admin.find({ user: { $in: users.map(user => user._id) }, status: 'active' })
    .populate("user", "email")
    .lean();
 
  // include vendor user
  adminUsers = [...adminUsers, vendor];

  let riderChats = await getAllChatsOfRider(currentUser);
 
  // Get IDs of users already in chats
  const existingChatUserIds = new Set(
    riderChats.map(chat => chat.member._id.toString())
  );

  // Filter adminUsers to only those not in existing chats
  const newAdminUsers = adminUsers.filter(adminUser => 
    !existingChatUserIds.has(adminUser.user._id.toString())
  );
  
  // Format newAdminUsers to match riderChats structure
  const formattedNewUsers = newAdminUsers.map(adminUser => ({
    _id: null, // no chat ID since chat doesn't exist yet
    member: {
      _id: adminUser.user._id,
      email: adminUser.user.email, 
      profile: {
        name: adminUser.name,
        photo: adminUser.photo
      }
    },
    lastMessage: null,
    unreadMessagesCount: 0,
    updatedAt: new Date(0), // set to epoch to ensure they appear at the bottom
    createdAt: new Date(0)
  }));

  // Combine with riderChats (already sorted) and new users at the bottom
  const allUsers = [...riderChats, ...formattedNewUsers];
  return allUsers; 
};



module.exports = { 
  createChat,
  getAllChatsOfUser,
  getAllChatsOfRider,
  getAllMessagesByChatId,
  messagesByTicketId,
  getChatUsers
};
