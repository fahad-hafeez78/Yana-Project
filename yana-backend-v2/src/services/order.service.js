const { status } = require('http-status'); 
const ApiError = require('../utils/ApiError');
const moment = require("moment-timezone");
const { Order, OrderPlacingDuration, Customer, Meal, Admin, AssignMenu, User, Organization } = require('../models'); 
const generateUniqueId = require('../utils/generateUnique');  
const { sendNotification, getCoordinatesFromAddress, isAddressEqual, getVendorIdForUser } = require('../utils/helper');
const { getIO, activeUsers } = require('../utils/socket/socket');


const createOrderAdmin = async (body) => { 
  let customer = await Customer.findById(body.customer).lean();
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  }

  // check if vendor is inactive
  if(body.meals.length > 0) {
    let vendor = await Admin.findById(body.meals[0].vendorId);
    if (!vendor || vendor.status !== 'active') {
      throw new ApiError(status.BAD_REQUEST, 'Vendor is not active');
    }
  }
 
  body.order_id = await generateUniqueId("ORD");
  
  if (isAddressEqual(body.delivery_location, customer.address)) {
    body.delivery_location = customer.address;
    // body.zone = customer.zone;
  } else {
    const fullAddress = `${body.delivery_location.street1}, ${body.delivery_location.street2 || ''}, ${body.delivery_location.city}, ${body.delivery_location.zip}, ${body.delivery_location.state}`;
    const geoPoint = await getCoordinatesFromAddress(fullAddress);
    body.delivery_location.coordinates = geoPoint;
    // body.zone = null;
  }

  let today = moment().tz("America/New_York");

  const orderPlacingDuration = await OrderPlacingDuration.findOne();
  if (orderPlacingDuration) {  
    let startOfEndDay = today.clone().day(orderPlacingDuration.endDay).endOf('day'); 
    const endOfComingSunday = today.clone().endOf('isoWeek'); 
    const isBetween = today.isBetween(startOfEndDay, endOfComingSunday, null, '[]');
    if (isBetween) {
      body.status = "active"; 
    }
  }
 
  const weekStart = today.clone().startOf('isoWeek').format("YYYY-MM-DD");
  body.orderWeek = `${body.customer}_${weekStart}`;

  body.vendor = customer.vendorId;

  let newOrder;
  try {
    newOrder = await Order.create(body); 
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.orderWeek) {
      throw new ApiError(status.BAD_REQUEST, "This customer already placed an order this week.");
    }
    throw err;
  }
    
  // Send notification to the customer about the order placement
  if (customer.fcm) {
    const title = "Your Order Has Been Placed!";
    let bodyText = "Your order has been placed successfully. Thank you for choosing us!";
    const fcmToken = customer.fcm;
    const imgURL = "";
    
    // Send notification
    await sendNotification(title, bodyText, fcmToken, imgURL); 
  }

  return newOrder;
};

const createOrderApp = async (user, body) => {  
  const [customer, orderPlacingDuration] = await Promise.all([
    Customer.findById(user.customer._id).populate("insurance").lean(),
    OrderPlacingDuration.findOne()
  ]);
  if (!customer) throw new ApiError(status.NOT_FOUND, 'Customer not found');
  if (!orderPlacingDuration) throw new ApiError(status.NOT_FOUND, "Order placing duration not set");
   
  // Get Current Day
  const currentDay = moment().tz('America/New_York').format("dddd");

  const allowedDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];
  const startIndex = allowedDays.indexOf(orderPlacingDuration.startDay);
  const endIndex = allowedDays.indexOf(orderPlacingDuration.endDay);
  const currentIndex = allowedDays.indexOf(currentDay);

  if (currentIndex < startIndex || currentIndex > endIndex) {
    throw new ApiError(
      status.BAD_REQUEST, `Orders can only be placed between ${orderPlacingDuration.startDay} and ${orderPlacingDuration.endDay}. Try next week.`
    );
  }

  // only can order the meals if meals are exist in assign menu
  let assignedMenu = await AssignMenu.findOne({ vendorId: customer.vendorId }).populate({
        path: 'assignments.menus',
        model: 'Menu',
        populate: {
            path: 'meals',
            model: 'Meal',
            match: { 
              status: 'active'
            }
        }
    }).lean();

  if (!assignedMenu) throw new ApiError(status.NOT_FOUND, 'no assigned meals found');

  const now = moment().tz('America/New_York'); 
  // Find active assignments
  const activeAssignments = assignedMenu.assignments.filter(assignment => 
    now.isBetween(moment(assignment.startDate).startOf('day'), moment(assignment.endDate).endOf('day'), null, '[]') 
  ); 

  if (activeAssignments.length === 0) throw new ApiError(status.NOT_FOUND, 'No active assignments');

  // Collect meals from active assignments
  const activeMeals = activeAssignments.flatMap(assignment => 
      assignment.menus.flatMap(menu => menu.meals)
          .filter(meal => meal !== null) // Remove any null meals after filtering
  );    

  if (activeMeals.length === 0) throw new ApiError(status.NOT_FOUND, 'no active meals found');

  // Check if the meals in the order are part of the assigned meals
  const mealIdsInOrder = body.meals.map(single => single.meal);
  const activeMealIds = activeMeals.map(meal => meal._id.toString());
  const invalidMeals = mealIdsInOrder.filter(mealId => !activeMealIds.includes(mealId));
  if (invalidMeals.length > 0) {
    throw new ApiError(status.BAD_REQUEST, `Meals are expired, please select from the active meals.`);
  }

  const { mealIds, totalQuantity } = body.meals.reduce(
    (acc, single) => {
      acc.mealIds.push(single.meal);
      acc.totalQuantity += single.quantity;
      return acc;
    },
    { mealIds: [], totalQuantity: 0 }
  );

  if(totalQuantity > customer.insurance.mealPlan) {
    throw new ApiError(status.BAD_REQUEST, `Total meals count should not be more than your meal plan. Your meal plan is: ${customer.insurance.mealPlan}`);
  } 
  const meals = await Meal.find({ status: "active", _id: { $in: mealIds } });
  if (meals.length !== mealIds.length) {
    throw new ApiError(status.BAD_REQUEST, "One or more meals not found.");
  }

  if (isAddressEqual(body.delivery_location, customer.address)) {
    body.delivery_location = customer.address;
    // body.zone = customer.zone;
  } else {
    const fullAddress = `${body.delivery_location.street1}, ${body.delivery_location.street2 || ''}, ${body.delivery_location.city}, ${body.delivery_location.zip}, ${body.delivery_location.state}`;
    const geoPoint = await getCoordinatesFromAddress(fullAddress);
    body.delivery_location.coordinates = geoPoint;
    // body.zone = null;
  } 
  
  body.order_units = totalQuantity;
  body.order_id = await generateUniqueId("ORD");
  body.status = "pending";
  body.customer = customer._id; 
  body.vendor = customer.vendorId;

  const today = moment().tz("America/New_York"); 
  const weekStart = today.clone().startOf('isoWeek').format("YYYY-MM-DD");
  body.orderWeek = `${body.customer}_${weekStart}`;

  let newOrder;
  try {
    newOrder = await Order.create(body);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.orderWeek) {
      throw new ApiError(status.BAD_REQUEST, "Your order is already placed this week.");
    }
    throw err;
  } 

  // Notify admins (non-blocking)
  (async () => {
    const vendorOfOrder = await Admin.findById(customer.vendorId).populate({
      path: "user", populate: { path: "organization", select: "name" }
    });
    const vendorOrgId = vendorOfOrder?.user?.organization?._id;
    const adminOrg = await Organization.findOne({ name: 'admin-organization' });
    const orgIds = [vendorOrgId];
    if (adminOrg) orgIds.push(adminOrg._id);
    const orgUsers = await User.find({ organization: { $in: orgIds } }).select('_id role').lean();
    const roleIds = orgUsers.map(u => u.role);

    // Fetch roles with 'order' page and 'view' action permission
    const rolesWithOrderView = await Role.find({
      _id: { $in: roleIds },
      permissions: {
        $elemMatch: {
          page: 'order',
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

    const adminTitle = "New Order Placed";
    const adminBody = `${customer.name} has placed a new order.`;
    // Send FCM notification to all admins (in parallel)
    await Promise.all(
      adminFcmTokens.map(token =>
        sendNotification(adminTitle, adminBody, token, "")
      )
    );

    // Send notification to the customer about the order placement
    if (customer.fcm) {
      const title = "Your Order has been placed!";
      const bodyText = `Your order has been placed successfully. You can edit your order until ${orderPlacingDuration.endDay}. Thank you for choosing us!`;
      const fcmToken = customer.fcm;
      const imgURL = "";
      
      // Send notification
      await sendNotification(title, bodyText, fcmToken, imgURL); 
    }
      
  })().catch(console.error);
   

  let firstOrderCreatedAt = moment(newOrder.createdAt);
  let nextThursday = firstOrderCreatedAt.day(11).format("YYYY-MM-DD");
  newOrder = newOrder.toObject();
  newOrder.nextThursday = nextThursday;
  return newOrder;
};

const getAllOrders = async (currentUser, query) => {
  const matchStage = [];
  let vendorId = await getVendorIdForUser(currentUser);

  if (vendorId) { 
    matchStage.push({
      $match: {
        vendor: vendorId,
      },
    });
  }

  // Step 1: Optional status filter
  if (query.status) {
    matchStage.push({
      $match: { status: query.status },
    });
  } else {
    matchStage.push({
      $match: { status: { $ne: 'soft_delete' } }
    });
  }

  // Step 2: Join with Customer
  matchStage.push({
    $lookup: {
      from: 'customers',
      localField: 'customer',
      foreignField: '_id',
      as: 'customer',
    },
  });

  matchStage.push({
    $unwind: {
      path: '$customer',
      preserveNullAndEmptyArrays: false, // only orders with a customer
    },
  });
 
  // Step 4: vendor of the order
  matchStage.push({
    $lookup: {
      from: 'admins',
      localField: 'vendor',
      foreignField: '_id',
      as: 'vendor',
    },
  });

  matchStage.push({
    $unwind: {
      path: '$vendor',
      preserveNullAndEmptyArrays: true,
    },
  }); 

  // Step 4: vendor of the order
  matchStage.push({
    $lookup: {
      from: 'riders',
      localField: 'assigned_rider',
      foreignField: '_id',
      as: 'assigned_rider',
    },
  });

  matchStage.push({
    $unwind: {
      path: '$assigned_rider',
      preserveNullAndEmptyArrays: true,
    },
  });
  
  // Step 5: Lookup meals.meal and meals.vendorId
  matchStage.push(
    {
      $unwind: {
        path: '$meals',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'meals',
        localField: 'meals.meal',
        foreignField: '_id',
        as: 'meals.meal',
      },
    },
    {
      $unwind: {
        path: '$meals.meal',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'admins',
        localField: 'meals.vendorId',
        foreignField: '_id',
        as: 'meals.vendorId',
      },
    },
    {
      $unwind: {
        path: '$meals.vendorId',
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  // Step 6: Group back meals
  matchStage.push({
    $group: {
      _id: '$_id',
      doc: { $first: '$$ROOT' },
      meals: { $push: '$meals' },
    },
  });

  // Step 7: Reconstruct document
  matchStage.push({
    $replaceRoot: {
      newRoot: {
        $mergeObjects: ['$doc', { meals: '$meals' }],
      },
    },
  });

  // Step 8: Sort by latest
  matchStage.push({
    $sort: { createdAt: -1 },
  });

  // Step 9: Optional project
  matchStage.push({
    $project: {
      order_id: 1,
      status: 1, 
      phone: 1,
      instructions: 1,
      order_units: 1,
      delivery_location: 1,
      createdAt: 1,
      updatedAt: 1,
      assigned_rider: { _id: 1, rider_id: 1, name: 1 },
      order_complete_date: 1, 
      pod: 1, 
      vendor: { _id: 1, vendor_id: 1, name: 1 }, 
      // zone: 1,
      customer: {
        _id: 1,
        customer_id: 1,
        name: 1,
        phone: 1,
        photo: 1,
        address: 1,
        alternate_contact: 1,
        allergies: 1,
      },
      meals: {
        meal: {_id: 1, name: 1, image: 1 },
        vendorId: { _id: 1, vendor_id: 1, name: 1 },
        quantity: 1,
      },
    },
  });

  const orders = await Order.aggregate(matchStage);
  return orders;
};

const vendorMealsStats = async (vendorId, statuss) => {
  let vendor = await Admin.findById(vendorId);
  if (!vendor) {
    throw new ApiError(status.NOT_FOUND, 'vendor not found');
  } 

  const vendor_details = {
    vendor_id: vendor.vendor_id || vendor._id, 
    name: vendor.name,
    phone: vendor.phone,
    address: vendor.address
  }

  let query = { "meals.vendorId": vendorId};
  if(statuss && statuss !== "all") {
    query.status = statuss;
  }

  const orders = await Order.find(query)
  .populate("customer", "customer_id name phone photo")
  .populate('meals.meal', 'name');

  if (orders.length === 0) {
    throw new ApiError(status.NOT_FOUND, 'orders not found');
  }

  let total_orders = orders.length;

  let mealStats = {};

  orders.forEach((order) => {
    order.meals.forEach((mealItem) => {
      if (mealItem.vendorId.toString() === vendorId.toString()) {
        let mealName = mealItem.meal.name; // Get meal name

        if (!mealStats[mealName]) {
          mealStats[mealName] = {
            meal_id: mealItem.meal._id,
            meal_name: mealName,
            total_quantity: 0,
          };
        }

        mealStats[mealName].total_quantity += mealItem.quantity;
      }
    });
  });

  // Convert mealStats object to array
  let meal_details = Object.values(mealStats);
  let total_meals = meal_details.reduce((sum, meal) => sum + meal.total_quantity, 0);

  let firstOrderCreatedAt = moment(orders[orders.length - 1].createdAt);
  let nextThursday = firstOrderCreatedAt.day(11).format("YYYY-MM-DD"); // 11 = Next week's Thursday (4 = this week's Thursday, +7)
 
  return { vendor_details, total_orders, meal_details, total_meals, nextThursday };
};

const customerAllOrders = async (user) => { 
  if (!user.customer || !user.customer._id) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  }

  const orders = await Order.find({customer: user.customer._id, status: {$ne: 'soft_delete'}})
  .populate("customer", "customer_id name phone photo")
  .populate('meals.meal', 'name image description');

  return orders;
};

const getOrderById = async (id) => {
  let order = await Order.findOne({ _id: id, status: { $ne: 'soft_delete' } })
  .populate("customer", "customer_id name phone photo address alternate_contact allergies")
  .populate('meals.meal', 'name image description')
  .populate('meals.vendorId', 'vendor_id name');

  if (!order) {
    throw new ApiError(status.NOT_FOUND, 'order not found');
  } 

  return order;
};

const trackOrder = async (currentUser) => { 
  if (!currentUser.customer || !currentUser.customer._id) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  }

  let order = await Order.findOne({ customer: currentUser.customer._id, status: {$in: ['pending', 'active', 'on the way']}})
  .populate("customer", "customer_id name phone photo address alternate_contact allergies")
  .populate('meals.meal', 'name image description')
  .populate('meals.vendorId', 'vendor_id name')
  .lean();

  if (!order) {
    throw new ApiError(status.NOT_FOUND, 'No order found');
  } 

  let orderCreatedAt = moment(order.createdAt);
  order.deliverdThursday = orderCreatedAt.day(11).format("YYYY-MM-DD"); 

  return order;
};

const updateOrderStatusToComplete = async (orderId) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(status.NOT_FOUND, 'order not found');
  } 

  if (order.status == "active") {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, 
      {
        status: 'completed',
        order_complete_date: moment().tz('America/New_York').toDate(),
      }, 
      { new: true }
    );
  
    return updatedOrder;
  } else {
    throw new ApiError(status.NOT_FOUND, 'Only active order can be complete');
  } 
  
};

const updateOrderById = async (id, updateBody) => {
    let order = await getOrderById(id);
    if (!order) {
      throw new ApiError(status.NOT_FOUND, 'order not found');
    } 

    if(updateBody.status == 'completed'){
      updateBody.order_complete_date = moment().tz('America/New_York').toDate();
    }

    if(updateBody.delivery_location){ 
      order = order.toObject();
      if (isAddressEqual(updateBody.delivery_location, order.customer.address)) {
        updateBody.delivery_location = order.customer.address;
        // updateBody.zone = order.customer.zone;
      } else {
        const fullAddress = `${updateBody.delivery_location.street1}, ${updateBody.delivery_location.street2 || ''}, ${updateBody.delivery_location.city}, ${updateBody.delivery_location.zip}, ${updateBody.delivery_location.state}`;
        const geoPoint = await getCoordinatesFromAddress(fullAddress);
        updateBody.delivery_location.coordinates = geoPoint;
        // updateBody.zone = null;
      }  
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateBody, { new: true, runValidators: true });
    return updatedOrder;
};

const customerUpdateOrderById = async (user, id, updateBody) => {
  let order = await getOrderById(id);
  if (!order) {
    throw new ApiError(status.NOT_FOUND, 'order not found');
  } 

  let customer = await Customer.findById(user.customer._id).populate("insurance");
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  }

  if (order.status !== "pending") {
    throw new ApiError(status.NOT_FOUND, 'You can not update your order now, as your order is moved to the next step. Contact with admin to update your order');
  }

  if(updateBody.meals && updateBody.meals.length > 0){
    const { mealIds, totalQuantity } = updateBody.meals.reduce(
      (acc, single) => {
        acc.mealIds.push(single.meal);
        acc.totalQuantity += single.quantity;
        return acc;
      },
      { mealIds: [], totalQuantity: 0 }
    );
  
    if(totalQuantity > customer.insurance.mealPlan) {
      throw new ApiError(status.BAD_REQUEST, `Total meals count should not be more than your meal plan. Your meal plan is: ${customer.insurance.mealPlan}`);
    } 
    const meals = await Meal.find({ _id: { $in: mealIds } });
    if (meals.length !== mealIds.length) {
      throw new ApiError(status.BAD_REQUEST, "One or more meals not found.");
    }
    
    updateBody.order_units = totalQuantity;
  }

  if(updateBody.delivery_location){ 
    order = order.toObject();
    if (isAddressEqual(updateBody.delivery_location, order.customer.address)) {
      updateBody.delivery_location = order.customer.address;
      // updateBody.zone = order.customer.zone;
    } else {
      const fullAddress = `${updateBody.delivery_location.street1}, ${updateBody.delivery_location.street2 || ''}, ${updateBody.delivery_location.city}, ${updateBody.delivery_location.zip}, ${updateBody.delivery_location.state}`;
      const geoPoint = await getCoordinatesFromAddress(fullAddress);
      updateBody.delivery_location.coordinates = geoPoint;
      // updateBody.zone = null;
    }  
  }

  let updatedOrder = await Order.findByIdAndUpdate(id, updateBody, { new: true, runValidators: true });

  let firstOrderCreatedAt = moment(updatedOrder.createdAt);
  let nextThursday = firstOrderCreatedAt.day(11).format("YYYY-MM-DD");
  updatedOrder = updatedOrder.toObject();
  updatedOrder.nextThursday = nextThursday;

  return updatedOrder;
};

const softDeleteOrder = async (id) => {
  let order = await Order.findById(id).populate("customer", "fcm");
  if (!order) {
    throw new ApiError(status.NOT_FOUND, 'order not found');
  } 

  const updatedOrder = await Order.findByIdAndUpdate(id, { status: 'soft_delete' }, { new: true, runValidators: true });

  // notify customer about order soft delete
  if (order.customer.fcm) {
    const title = "Your Order Request Rejected";
    const bodyText = `Your order request has been rejected. Please contact support for more details.`;
    const fcmToken = order.customer.fcm;
    const imgURL = "https://cdn-icons-png.flaticon.com/256/1478/1478938.png";

    // Send notification
    await sendNotification(title, bodyText, fcmToken, imgURL);
  }

  return;
};

const getSoftDeletedOrders = async (currentUser) => {  
  if(currentUser.role.name !== 'admin') {
    throw new ApiError(status.UNAUTHORIZED, 'Only Admin can view soft deleted orders');
  }

  const orders = await Order.find({status: 'soft_delete'})
  .populate("customer", "customer_id name phone photo")
  .populate('vendor', 'vendor_id name phone photo').lean();

  return orders;
};

const deleteOrderById = async (id, currentUser) => { 
  if(currentUser.role.name !== 'admin') {
    throw new ApiError(status.UNAUTHORIZED, 'Only Admin can delete orders');
  }
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(status.NOT_FOUND, 'order not found');
  }

  await Order.findByIdAndDelete(id);
  return;
};

const getOrderPlacingDuration = async () => {
  let duration = await OrderPlacingDuration.findOne();  
  if (!duration) {
    throw new ApiError(status.NOT_FOUND, "Order placing duration not set");
  }  
  return duration;
};

const updateOrderPlacingDuration = async (updateBody) => {
  const { startDay, endDay } = updateBody; 
  return await OrderPlacingDuration.findOneAndUpdate({}, { startDay, endDay }, { new: true, upsert: true, runValidators: true });
};

const bulkStatusUpdate = async (ids, newStatus) => { 
  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false, message: "Invalid input: Ids must be a non-empty array", data: {} };
  }

  const orders = await Order.find({ _id: { $in: ids } });
  if (orders.length == 0) {
    return { 
        success: false, 
        message: "No orders found with the provided Ids", 
        data: {}
    };
  }

  let updatedCount = 0;
  const updatedOrders = [];
  
  for (const order of orders) {
    if (order.status !== newStatus) {
      let updateData = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.order_complete_date = moment().tz('America/New_York').toDate();
      }
      
      const updated = await Order.findByIdAndUpdate(order._id, updateData, { new: true, runValidators: true });
      updatedOrders.push(updated);
      updatedCount++;
    }
  }

  return { 
    success: true, 
    message: "Orders Bulk Status update successful",
    data: {
      totalRequested: ids.length,
      updatedCount: updatedCount,
      updatedOrders: updatedOrders
    }
  };
};

const getLatestOrdersByCustomerId = async (customerId) => {
  if (!customerId) {
    throw new ApiError(status.BAD_REQUEST, 'Customer ID is required');
  }
  return Order.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('order_id status order_units order_complete_date createdAt updatedAt')
    .lean();
};

module.exports = {
    createOrderAdmin,
    createOrderApp,
    getAllOrders,
    vendorMealsStats,
    customerAllOrders,
    getOrderById,
    trackOrder,
    updateOrderById,
    updateOrderStatusToComplete,
    customerUpdateOrderById,
    softDeleteOrder,
    getSoftDeletedOrders,
    deleteOrderById,
    getOrderPlacingDuration,
    updateOrderPlacingDuration,
    bulkStatusUpdate,
    getLatestOrdersByCustomerId
};
