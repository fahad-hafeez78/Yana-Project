const { status } = require('http-status');
const mongoose = require("mongoose");
const ApiError = require('../utils/ApiError');
const { Task } = require('../models');
const generateUniqueId = require('../utils/generateUnique');
const { uploadToS3, deleteFromS3 } = require('./s3Bucket.service');
const { getVendorIdForUser, sendNotification } = require('../utils/helper');

const createTask = async (currentUser, file, body) => {
  body.task_id = await generateUniqueId("TSK");
  body.user = currentUser._id; 
  if (file) {
    const imageUrl = await uploadToS3(file, "task"); 
    body.image = imageUrl;
  }
 
  let newTask = await Task.create(body);

  if(body.assignTo){  
    const assignToUser = await User.findById(body.assignTo).select('_id role').lean();
     
    const rolesWithTaskView = await Role.findOne({
      _id: assignToUser.role,
      permissions: {
        $elemMatch: {
          page: 'task',
          actions: 'view'
        }
      }
    }).select('_id').lean(); 

    if(rolesWithTaskView) {
      const adminUser = await Admin.findOne({ user: assignToUser._id }).select('fcm').lean();
      if(adminUser.fcm) {
        const adminTitle = "New Task Received";
        const adminBody = `${currentUser.admin_user.name} send a new task.`; 
        await sendNotification(adminTitle, adminBody, adminUser.fcm, "")
      }  
    } 
  }

  return newTask;
};

const allTasks = async (currentUser, body) => {
  const { status } = body;
  let query = {};
  let vendorId = await getVendorIdForUser(currentUser);
  
  if (!vendorId) {
    if(status == 'all') {
      query = {};
    } else if (status !== 'all') {
      query.status = status;
    }
  } else { 
    if (status == 'all') {
      query.$or = [
        { user: currentUser._id },
        { assignTo: currentUser._id }
      ]; 
    } else if (status !== 'all') {
      query.status = status;
      query.$or = [
        { user: currentUser._id },
        { assignTo: currentUser._id }
      ];
    } 
  } 

    const tasks = await Task.aggregate([
        {
          $match: query
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
            preserveNullAndEmptyArrays: false
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
            preserveNullAndEmptyArrays: false
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
            preserveNullAndEmptyArrays: false
          }
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
            from: "admins",
            let: { userId: "$user._id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
              { $project: { name: 1, phone: 1, photo: 1, _id: 0 } }
            ],
            as: "createdBy_admin_user"
          }
        },
        {
          $unwind: {
            path: "$createdBy_admin_user",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $addFields: {
            user: { $mergeObjects: ["$user", "$createdBy_admin_user"] },
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
            "user.hierarchyLevel",
            "user.hierarchyPath",
            "user.createdBy", 
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
            "createdBy_admin_user",
            "assignTo_admin_user",
            "assignTo_role"
          ]
        }
    ]);

   return tasks;
};

const getTaskById = async (id) => {
  const task = await Task.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) }
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
        preserveNullAndEmptyArrays: false
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
        preserveNullAndEmptyArrays: false
      }
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
        from: "admins",
        let: { userId: "$user._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
          { $project: { name: 1, phone: 1, photo: 1, _id: 0 } }
        ],
        as: "createdBy_admin_user"
      }
    },
    {
      $unwind: {
        path: "$createdBy_admin_user",
        preserveNullAndEmptyArrays: false
      }
    },
    {
      $addFields: {
        user: { $mergeObjects: ["$user", "$createdBy_admin_user"] },
        assignTo: { $mergeObjects: ["$assignTo", "$assignTo_admin_user"] }
      }
    },
    {
      $unset: [
        "user.hierarchyLevel",
        "user.hierarchyPath",
        "user.createdBy", 
        "user.role",
        "user.username",
        "user.password",
        "user.createdAt",
        "user.updatedAt",
        "assignTo.hierarchyLevel",
        "assignTo.hierarchyPath",
        "assignTo.createdBy", 
        "assignTo.role",
        "assignTo.username",
        "assignTo.password",
        "assignTo.createdAt",
        "assignTo.updatedAt", 
        "createdBy_admin_user",
        "assignTo_admin_user"
      ]
    }
  ]);

  if (!task.length) {
    throw new ApiError(status.NOT_FOUND, 'Task not found');
  }
  return task[0];
};
  
const updateTaskById = async (id, file, updateBody) => {
  const task = await getTaskById(id);
  if (!task) {
    throw new ApiError(status.NOT_FOUND, 'Task not found');
  }

  if (file) {
    const imageKey = task.image?.split(`.amazonaws.com/`)[1]; // Extract key from URL
    if (imageKey) {
      await deleteFromS3(imageKey);  
    }
    const imageUrl = await uploadToS3(file, "task"); 
    updateBody.image = imageUrl;
  }

  if(updateBody.assignTo && updateBody.assignTo.toString() !== task.assignTo.toString()){  
    const assignToUser = await User.findById(updateBody.assignTo).select('_id role').lean();
     
    const rolesWithTaskView = await Role.findOne({
      _id: assignToUser.role,
      permissions: {
        $elemMatch: {
          page: 'task',
          actions: 'view'
        }
      }
    }).select('_id').lean(); 

    if(rolesWithTaskView) {
      const adminUser = await Admin.findOne({ user: assignToUser._id }).select('fcm').lean();
      if(adminUser.fcm) {
        const adminTitle = "New Task Received";
        const adminBody = `${currentUser.admin_user.name} send a new task.`; 
        await sendNotification(adminTitle, adminBody, adminUser.fcm, "")
      }  
    } 
  }

  const updatedTask = await Task.findByIdAndUpdate(
    id,
    { $set: updateBody },
    { new: true, runValidators: true }  
  );

  return await getTaskById(id);
};

const deleteTaskById = async (id) => {
  const task = await getTaskById(id);
  if (!task) {
    throw new ApiError(status.NOT_FOUND, 'Task not found');
  }
  
  await Task.findByIdAndDelete(id);
  return;
};


module.exports = {
  createTask,
  allTasks,
  getTaskById,  
  updateTaskById,
  deleteTaskById,
};
