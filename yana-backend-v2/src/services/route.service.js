const { status } = require('http-status');
const axios = require('axios');
const moment = require("moment-timezone");
const {kmeans} = require('ml-kmeans'); 
const ApiError = require('../utils/ApiError');
const { Route, Order, Zone, Rider, Customer, Admin } = require('../models'); 
const config = require('../config/config'); 
const { deleteFromS3, uploadToS3 } = require('./s3Bucket.service');
const { sendNotification, haversineDistance, getStopNumber, getVendorIdForUser } = require('../utils/helper');
const { getIO } = require('../utils/socket/socket');
 
 
const createRoutes = async (params) => { 
  const { vendorId } = params;   

  // Check if vendor exists
  let vendor = await Admin.findById(vendorId).populate("user").lean();
  if (!vendor) {
    throw new ApiError(status.NOT_FOUND, 'Vendor not found');
  }

  const today = moment().tz("America/New_York"); 
  // Calculate start of week (Monday)
  const startOfWeek = today.clone().startOf('isoWeek');
  // Calculate end of week (Sunday)
  const endOfWeek = startOfWeek.clone().add(6, 'days').endOf('day'); 

  // Current Week routes already created
  const weekRoutes = await Route.find({
    createdAt: {
      $gte: startOfWeek.toDate(),
      $lte: endOfWeek.toDate()
    },
    vendorId: vendor._id
  }).lean();
  if (weekRoutes.length > 0) {
    throw new ApiError(status.BAD_REQUEST, 'Routes are already created for this vendor.'); 
  } 

  // If orders with null zone found, then routes should not create 
  const ordersWithNullZone = await Order.find({
    status: 'active',
    vendor: vendor._id,
    zone: null,
    createdAt: {
      $gte: startOfWeek.toDate(),
      $lte: endOfWeek.toDate()
    }
  }).lean(); 
  if (ordersWithNullZone.length > 0) {
    throw new ApiError(status.BAD_REQUEST, 'Please assign zones to all orders of the vendor before creating routes.');
  }

  // Get all active zones
  const zones = await Zone.find().lean();
  if (!zones || zones.length === 0) {
    throw new ApiError(status.BAD_REQUEST, 'No zones found.');
  }

  let routesToCreate = [];
  
  for (const zone of zones) {
    // Get all active orders for the zone
    const orders = await Order.find({
      status: 'active',
      vendor: vendor._id,
      zone: zone._id,
      createdAt: {
        $gte: startOfWeek.toDate(),
        $lte: endOfWeek.toDate()
      }
    }).lean();

    if (orders.length === 0) continue;  // Skip

    let rider = await Rider.findOne({ zone: zone._id, vendorId: vendor._id, status: 'active' }).lean();
    if (!rider) {
      throw new ApiError(status.BAD_REQUEST, `No active rider found for zone ${zone.name} and vendor ${vendor.name}.`);
    }

    const originLat = vendor.kitchen_address.coordinates.coordinates[1];
    const originLng = vendor.kitchen_address.coordinates.coordinates[0];
    // const originLat = '33.64211088941641'; // EZMD Rawalpindi 
    // const originLng = '73.05963513953303';

    let orderCoordinates = orders.map(order => ({
      order,
      coords: `${order.delivery_location.coordinates.coordinates[1]},${order.delivery_location.coordinates.coordinates[0]}`,
      lat: order.delivery_location.coordinates.coordinates[1],
      lng: order.delivery_location.coordinates.coordinates[0],
    }));

    orderCoordinates = orderCoordinates.map(order => ({
      ...order,
      distanceFromOrigin: haversineDistance(originLat, originLng, order.lat, order.lng)
    }));
 
    // Preserve original order but move farthest to the end
    const maxIdx = orderCoordinates.reduce((maxIdx, cur, idx, arr) =>
      cur.distanceFromOrigin > arr[maxIdx].distanceFromOrigin ? idx : maxIdx, 0
    );
    const [farthest] = orderCoordinates.splice(maxIdx, 1);
    orderCoordinates.push(farthest);

    // Step 4: Rebuild waypoints in new order
    const waypointsOrdered = orderCoordinates.map(o => o.coords); 

    const origin = `${originLat}, ${originLng}`; 

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin, 
        destination: waypointsOrdered[waypointsOrdered.length - 1],
        travelMode: 'DRIVING',
        waypoints: `optimize:true|${waypointsOrdered.join('|')}`,
        optimizeWaypoints: true,
        // drivingOptions: {
        //   departureTime: moment().tz("America/New_York"),
        //   trafficModel: 'bestguess'
        // },
        key: config.google_map_key
      }
    });

    const { routes } = response.data;
    if (!routes || routes.length === 0) {
      throw new ApiError(status.BAD_REQUEST, `Route creation failed for zone ${zone.name}.`);
    }
    let optimizedOrder = routes[0].waypoint_order; 
  
    // Build `stopsData` from your own `orderCoordinates`, not `optimizedOrder`
    let stopsData = await Promise.all(orderCoordinates.map(async(item, i) => {
      const stopNumber = await getStopNumber(i, orderCoordinates, optimizedOrder);
      const order = item.order;
      return {
        order: order._id,
        location: [item.lng, item.lat],
        sequence: stopNumber,
        // distance: legs[i]?.distance?.value || 0,
        // duration: legs[i]?.duration?.value || 0,
        // distanceFromOrigin: item.distanceFromOrigin
      };
    }));
   
    routesToCreate.push({
      rider: rider._id,
      zone: zone._id,
      stops: stopsData, 
      directions: {
        polyline: routes[0].overview_polyline.points,
        distance: routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0),
        duration: routes[0].legs.reduce((acc, leg) => acc + leg.duration.value, 0)
      }
    }); 
  }

  if (routesToCreate.length === 0) {
    throw new ApiError(status.BAD_REQUEST, 'No active orders found for any zone this week.');
  }

  const session = await Route.startSession();
  session.startTransaction();

  try {
    for (const route of routesToCreate) {
      await Route.create([{
        rider: route.rider,
        zone: route.zone,
        vendorId: vendor._id, 
        stops: route.stops,
        directions: route.directions
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    return await Route.find({
      createdAt: {
        $gte: startOfWeek.toDate(),
        $lte: endOfWeek.toDate()
      },
      vendorId: vendor._id
    }).populate("rider", "rider_id name photo")
      .populate("zone")
      .populate("stops.order", "order_id delivery_location") 
      .lean(); 

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(status.INTERNAL_SERVER_ERROR, `Route creation failed: ${err.message}`);
  } 
};

// Route creation without zones (clustering-based assignment)
const createRoutesWithoutZones = async (params) => {
  const { vendorId } = params;

  // Check if vendor exists
  let vendor = await Admin.findById(vendorId).populate('user').lean();
  if (!vendor) {
    throw new ApiError(status.NOT_FOUND, 'Vendor not found');
  }

  const today = moment().tz('America/New_York');
  const startOfWeek = today.clone().startOf('isoWeek');
  const endOfWeek = startOfWeek.clone().add(6, 'days').endOf('day');

  // Check if routes already created for this week (without zone)
  const weekRoutes = await Route.find({
    createdAt: {
      $gte: startOfWeek.toDate(),
      $lte: endOfWeek.toDate(),
    },
    vendorId: vendor._id
  }).lean();
  if (weekRoutes.length > 0) {
    throw new ApiError(status.BAD_REQUEST, 'This vendor already has a generated route that is not yet completed.');
  }

  // Get all active riders for the vendor
  const riders = await Rider.find({ vendorId: vendor._id, status: 'active' }).lean();
  if (!riders || riders.length === 0) {
    throw new ApiError(status.BAD_REQUEST, 'Active riders not found for this vendor.');
  }

  // Get all active orders for the vendor for this week
  const orders = await Order.find({
    status: 'active',
    vendor: vendor._id,
    createdAt: {
      $gte: startOfWeek.toDate(),
      $lte: endOfWeek.toDate(),
    },
  }).lean();
  if (!orders || orders.length === 0) {
    throw new ApiError(status.BAD_REQUEST, 'No active orders available in the current week for this vendor.');
  }

  // If there are fewer orders than riders, some riders will get no orders
  const k = Math.min(riders.length, orders.length);

  // Prepare data for clustering
  const orderCoords = orders.map((order) => [
    order.delivery_location.coordinates.coordinates[1], // lat
    order.delivery_location.coordinates.coordinates[0], // lng
  ]);

  // Run K-Means clustering
  let clusters;
  if (k === 1) {
    clusters = { clusters: Array(orders.length).fill(0) };
  } else {
    clusters = kmeans(orderCoords, k);
  }

  // Assign orders to clusters
  const clusterAssignments = Array.from({ length: k }, () => []);
  clusters.clusters.forEach((clusterIdx, orderIdx) => {
    clusterAssignments[clusterIdx].push(orders[orderIdx]);
  });

  // Assign clusters to riders (1:1, order doesn't matter)
  const assignedRiders = riders.slice(0, k);

  // Get vendor kitchen as origin
  const originLat = vendor.kitchen_address.coordinates.coordinates[1];
  const originLng = vendor.kitchen_address.coordinates.coordinates[0];
  const origin = `${originLat},${originLng}`;

  let routesToCreate = [];

  for (let i = 0; i < assignedRiders.length; i++) {
    const rider = assignedRiders[i];
    const assignedOrders = clusterAssignments[i];
    if (assignedOrders.length === 0) continue;

    // Prepare waypoints for Google Directions API
    let orderCoordinates = assignedOrders.map((order) => ({
      order,
      coords: `${order.delivery_location.coordinates.coordinates[1]},${order.delivery_location.coordinates.coordinates[0]}`,
      lat: order.delivery_location.coordinates.coordinates[1],
      lng: order.delivery_location.coordinates.coordinates[0],
    }));

    // Use Google Directions API to optimize route
    const waypointsOrdered = orderCoordinates.map((o) => o.coords);
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination: waypointsOrdered[waypointsOrdered.length - 1],
        travelMode: 'DRIVING',
        waypoints: `optimize:true|${waypointsOrdered.join('|')}`,
        optimizeWaypoints: true,
        key: config.google_map_key,
      },
    });

    const { routes } = response.data;
    if (!routes || routes.length === 0) {
      throw new ApiError(status.BAD_REQUEST, `Route creation failed for rider ${rider.name}.`);
    }
    let optimizedOrder = routes[0].waypoint_order;

    // Build stopsData
    let stopsData = await Promise.all(orderCoordinates.map(async (item, idx) => {
      // Map optimized order index to sequence
      const stopNumber = optimizedOrder ? optimizedOrder.indexOf(idx) + 1 : idx + 1;
      const order = item.order;
      return {
        order: order._id,
        location: [item.lng, item.lat],
        sequence: stopNumber,
      };
    }));

    const totalDistanceMeters = routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0);
    const totalDurationSeconds = routes[0].legs.reduce((acc, leg) => acc + leg.duration.value, 0);

    // Convert distance to miles
    const distanceInMiles = (totalDistanceMeters / 1609.34).toFixed(2); // Keep 2 decimal places

    // Convert duration to hours and minutes
    const hours = Math.floor(totalDurationSeconds / 3600);
    const minutes = Math.floor((totalDurationSeconds % 3600) / 60);

    routesToCreate.push({
      rider: rider._id,
      // zone: null,
      stops: stopsData,
      directions: {
        polyline: routes[0].overview_polyline.points,
        distance: parseFloat(distanceInMiles),  
        duration: {
          hours,
          minutes
        }
      },
    });
  }

  if (routesToCreate.length === 0) {
    throw new ApiError(status.BAD_REQUEST, 'No routes to create (no orders assigned to any rider).');
  }

  const session = await Route.startSession();
  session.startTransaction();

  try {
    for (const route of routesToCreate) {
      await Route.create([
        {
          rider: route.rider, 
          vendorId: vendor._id, 
          stops: route.stops,
          directions: route.directions,
        },
      ], { session });
    }

    await session.commitTransaction();
    session.endSession();

    return await Route.find({
      createdAt: {
        $gte: startOfWeek.toDate(),
        $lte: endOfWeek.toDate(),
      },
      vendorId: vendor._id, 
    })
      .populate('rider', 'rider_id name photo')
      .populate('stops.order', 'order_id delivery_location')
      .lean();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(status.INTERNAL_SERVER_ERROR, `Route creation failed: ${err.message}`);
  }
};
 
const queryRoutes = async (currentUser, body) => {
  const { status } = body;
  let query = {};

  let vendorId = await getVendorIdForUser(currentUser);
  if (status === 'all') {
    if (vendorId) query.vendorId = vendorId;
  } else {
      query.status = status;
      if (vendorId) query.vendorId = vendorId;
  }
  // if (type === 'current') {  
  //   query.status = { $in: ['pending', 'assigned', 'inprogress', 'pause'] };
  //   if (vendorId) {
  //     query.vendorId = vendorId;
  //   }
  // } 
   
  // if (type === 'previous') {
  //   if (!date) {
  //     throw new ApiError(status.BAD_REQUEST, 'Date is required for previous routes.');
  //   }
  //   // Calculate start of week (Monday)
  //   const startOfWeek = moment(date).clone().startOf('isoWeek');
  //   // Calculate end of week (Sunday)
  //   const endOfWeek = startOfWeek.clone().add(6, 'days').endOf('day'); 

  //   query.createdAt = { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }; 
  //   if (vendorId) {
  //     query.vendorId = vendorId;
  //   }
  // } 
  
  const routes = await Route.find(query)
    .populate("rider", "rider_id name photo")   
    .populate("stops.order", "order_id delivery_location") 
    .populate("vendorId", "vendor_id name photo kitchen_address")
    .sort({createdAt: -1})
    .lean(); 
    
  return routes;
};

const assignToRiders = async (params) => {
  const { vendorId } = params; 

  // Check if vendor exists
  let vendor = await Admin.findById(vendorId).populate("user").lean();
  if (!vendor) {
    throw new ApiError(status.NOT_FOUND, 'Vendor not found');
  }

  const today = moment().tz("America/New_York"); 
  // Calculate start of week (Monday)
  const startOfWeek = today.clone().startOf('isoWeek');
  // Calculate end of week (Sunday)
  const endOfWeek = startOfWeek.clone().add(6, 'days').endOf('day'); 

  // Current Week routes 
  const routes = await Route.find({
    vendorId: vendor._id,
    createdAt: {
      $gte: startOfWeek.toDate(),
      $lte: endOfWeek.toDate()
    }
  }).lean();
  if (routes.length === 0) {
    throw new ApiError(status.BAD_REQUEST, 'Vendor routes not found for current week.'); 
  }

  // assign route to riders by by updating status as 'assigned', if routes are pending
  const pendingRoutes = routes.filter(route => route.status === 'pending');
  if (pendingRoutes.length === 0) {
    throw new ApiError(status.BAD_REQUEST, 'This vendor routes are already assigned to riders.');
  }

  // Now only assign those routes which are pending 
  await Route.updateMany(
    { vendorId: vendor._id, createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }, status: 'pending' },
    { $set: { status: 'assigned' } }
  );

  // Notify riders about assigned routes
  for (const route of pendingRoutes) {
    const rider = await Rider.findById(route.rider).lean();
    if (rider.fcm) {
      const title = "New Route Assigned";
      const bodyText = `You have been assigned a new route.`;
      const fcmToken = rider.fcm;
      const imgURL = "";

      // Send notification
      await sendNotification(title, bodyText, fcmToken, imgURL);
    }
  }
 
  const updatedRoutes = await Route.find({
    vendorId: vendor._id,
    createdAt: {
      $gte: startOfWeek.toDate(),
      $lte: endOfWeek.toDate()
    }
  })
  .populate("rider", "rider_id name photo") 
  .populate("stops.order", "order_id delivery_location") 
  .lean(); 
    
  return updatedRoutes;
};

const unassignedZoneOrders = async (currentUser) => {
   const today = moment().tz("America/New_York"); 
  // Calculate start of week (Monday)
  const startOfWeek = today.clone().startOf('isoWeek');
  // Calculate end of week (Sunday)
  const endOfWeek = startOfWeek.clone().add(6, 'days').endOf('day'); 

  const ordersWithNullZone = await Order.find({
    status: 'active',
    zone: null,
    createdAt: {
      $gte: startOfWeek.toDate(),
      $lte: endOfWeek.toDate()
    }
  })
  .populate("customer", "customer_id name phone photo address alternate_contact allergies")
  .populate("vendor", "vendor_id name photo")
  .lean();

  return ordersWithNullZone;

};

const assignZoneToOrder = async (body) => {
  const { orderId, zoneId } = body;
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(status.NOT_FOUND, 'Order not found');
  }
  const zone = await Zone.findById(zoneId);
  if (!zone) {
    throw new ApiError(status.NOT_FOUND, 'Zone not found'); 
  }
  
  order.zone = zone._id;
  await order.save();
  
  return order;
};

const getRouteById = async (id) => {
  let route = await Route.findById(id)
    .populate("rider", "rider_id name photo") 
    .populate("stops.order", "order_id delivery_location") 
    .populate("vendorId", "vendor_id name photo kitchen_address");

  if (!route) {
    throw new ApiError(status.NOT_FOUND, 'route not found');
  } 

  return route;
};

const getRiderNewRoute = async (currentUser) => {
  if (!currentUser.rider) {
    throw new ApiError(status.NOT_FOUND, 'rider not found');
  }
  let route = await Route.findOne({ rider: currentUser.rider._id, status: {$in: ['assigned', 'inprogress', 'pause']} })
    .sort({ createdAt: -1 })
    .populate("rider", "rider_id name photo")  
    .populate({
      path: "stops.order",
      select: "customer order_id delivery_location",
      populate: {
          path: "customer",
          select: "name customer_id"
      }
    })
    .populate("vendorId", "vendor_id name photo kitchen_address"); 

  if (!route) {
    throw new ApiError(status.NOT_FOUND, 'No route assigned');
  } 

  return route;
};

const getCustomerNewRoute = async (currentUser) => {
  if (!currentUser.customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  }

  // 1. Find customer's pending order
  const customerOrder = await Order.findOne({
    customer: currentUser.customer._id,
    status: 'on the way',
  });

  if (!customerOrder) {
    throw new ApiError(status.NOT_FOUND, 'No active order found for customer');
  }

  let current_route = await Route.findOne({ 
    status: {$in: ['inprogress', 'pause']},
    'stops.order': customerOrder._id,
    'stops.status': 'pending'
  })
  .populate("rider", "rider_id name photo") 
  .populate({
      path: "stops.order",
      select: "customer order_id delivery_location",
      populate: {
          path: "customer",
          select: "name customer_id"
      }
  })
  .populate("vendorId", "vendor_id name photo kitchen_address"); 

  if (!current_route) {
    throw new ApiError(status.NOT_FOUND, 'No active route found for this order');
  } 

  // 3. Keep only the relevant stop (this customer's order stop) from the stops array
  current_route.stops = current_route.stops.filter(stop => {
    return stop.order._id.toString() === customerOrder._id.toString() && stop.status === 'pending';
  });

  if (current_route.stops.length === 0) {
    throw new ApiError(status.NOT_FOUND, 'No pending stop for this order in the route');
  }

  // Get vendor kitchen coordinates
  const vendor = current_route.vendorId;
  if (!vendor || !vendor.kitchen_address || !vendor.kitchen_address.coordinates) {
    throw new ApiError(status.NOT_FOUND, 'Vendor kitchen location not found.');
  }

  const originLat = vendor.kitchen_address.coordinates.coordinates[1];
  const originLng = vendor.kitchen_address.coordinates.coordinates[0];
  const origin = `${originLat},${originLng}`;

  // Get customer delivery coordinates
  const customerLat = current_route.stops[0].order.delivery_location.coordinates.coordinates[1];
  const customerLng = current_route.stops[0].order.delivery_location.coordinates.coordinates[0];
  const destination = `${customerLat},${customerLng}`;

  // Get optimized route from kitchen to customer
  const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
    params: {
      origin,
      destination,
      travelMode: 'DRIVING',
      // optimizeWaypoints: true,
      key: config.google_map_key,
    },
  }); 

  const { routes } = response.data;
  if (!routes || routes.length === 0) {
    throw new ApiError(status.BAD_REQUEST, 'Could not generate route to customer location.');
  }

  current_route.directions.polyline = routes[0].overview_polyline.points;

  return current_route;
};

const getAllRoutesOfRider = async (currentUser) => {
  if (!currentUser.rider) {
    throw new ApiError(status.NOT_FOUND, 'rider not found');
  }
  let routes = await Route.find({ rider: currentUser.rider._id, status: {$in: ['assigned', 'inprogress', 'pause', 'completed']} })
    .sort({ createdAt: -1 })
    .populate("rider", "rider_id name photo")  
    .populate({
      path: "stops.order",
      select: "customer order_id delivery_location",
      populate: {
          path: "customer",
          select: "name customer_id"
      }
    })
    .populate("vendorId", "vendor_id name photo kitchen_address")
    .lean(); 

  if (!routes || routes.length === 0) {
    throw new ApiError(status.NOT_FOUND, 'routes not found');
  } 

  return routes;
};

const updateRouteById = async (id, updateBody) => {
    const route = await Route.findById(id);
    if (!route) {
      throw new ApiError(status.NOT_FOUND, 'route not found');
    } 

    route.stops = updateBody.stops;
    route.stops.sort((a, b) => a.sequence - b.sequence);
    await route.save();

    return await getRouteById(id);
};

const updateRouteStatus = async (body) => {
  const {routeId, status} = body;
  const io = getIO();

  let route = await Route.findById(routeId);
  if (!route) {
    throw new ApiError(status.NOT_FOUND, 'route not found');
  }
  
  if(status == 'inprogress'){
    route.start_time = moment().tz("America/New_York");
    const orderIds = route.stops.map(stop => stop.order);
    
    // Batch update all relevant orders
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status: 'on the way' } }
    );
  }

  route.status = status;
  await route.save();
 
  io.to(`routeTracking-${route._id.toString()}`).emit("routeStatus", { routeId: route._id, route_status: route.status });

  let updatedRoute = await getRouteById(route._id); 
  // updatedRoute = updatedRoute.toObject();  
      
  return updatedRoute;
};

const updateOrderStatus = async (currentUser, file, body) => {
  let { routeId, orderId, status: order_status } = body; 
  const io = getIO();

  const [route, order] = await Promise.all([
    Route.findOne({
      _id: routeId,
      rider: currentUser.rider._id,
      status: { $in: ['assigned', 'inprogress', 'pause', 'completed'] },
      'stops.order': orderId,
    }).select('_id status rider stops').lean(),
    Order.findById(orderId).select('_id status pod order_complete_date')
  ]);

  // Early exits
  if (!route) throw new ApiError(status.NOT_FOUND, 'Route or order in route not found');
  if (route.status === 'completed') throw new ApiError(status.BAD_REQUEST, 'Route already completed');
  if (!order) throw new ApiError(status.NOT_FOUND, 'order not found');
   
 // Start file upload early (non-blocking promise)
  let fileUploadPromise;
  if (file) {
    fileUploadPromise = (async () => {
      if (order.pod) {
        const imageKey = order.pod?.split(`.amazonaws.com/`)[1];
        if (imageKey) await deleteFromS3(imageKey).catch(() => {});
      }
      const podUrl = await uploadToS3(file, "pods");
      order.pod = podUrl;  // Update order after upload completes
    })();
  }
 
  if(order_status == 'delivered'){
    order.status = 'completed';
    order.order_complete_date = moment().tz("America/New_York");
    order.assigned_rider = currentUser.rider._id;
  } else if(order_status == 'canceled'){
    order.status = 'canceled'; 
    order.assigned_rider = currentUser.rider._id;
  } 

  // Wait for file upload before saving order
  if (fileUploadPromise) await fileUploadPromise;

   // Save order & update route stop in parallel
  const [_, updatedRoute] = await Promise.all([
    order.save(),
    Route.findOneAndUpdate(
      { _id: route._id, 'stops.order': orderId },
      {
        $set: {
          'stops.$.status': order_status,
          'stops.$.nextDestination': false,
        },
      },
      { new: true }
    ).populate("stops.order", "order_id delivery_location").lean(),
    fileUploadPromise
  ]); 
        
  // Check if all stops are completed without fetching full route
  const allCompleted = await Route.findOne({
    _id: route._id,
    stops: {
      $not: {
        $elemMatch: {
          status: { $nin: ['delivered', 'canceled'] }
        }
      }
    }
  }).select('_id').lean();

  if (allCompleted) {
    await Route.updateOne({ _id: route._id }, { $set: { status: 'completed' } });  
    setImmediate(() =>
      io.to(`routeTracking-${route._id.toString()}`).emit("routeStatus", {
        routeId: route._id,
        route_status: 'completed',
      })
    );
  } 

  setImmediate(() =>
    io.to(`routeTracking-${route._id.toString()}`).emit("stopsData", {
      routeId: route._id,
      stops: updatedRoute.stops,
    })
  ); 

  return {
    ...updatedRoute,
    status: allCompleted ? 'completed' : updatedRoute.status
  };
};

const nextDestination = async (body) => {
  const { routeId, orderId } = body; 
  const io = getIO(); 

  const route = await Route.findById(routeId).populate("stops.order", "order_id delivery_location").populate("rider", "rider_id name photo");
  if (!route) {
    throw new ApiError(status.NOT_FOUND, 'Route not found');
  }

  let order = await Order.findById(orderId).lean();
  if (!order) {
    throw new ApiError(status.NOT_FOUND, 'order not found');
  }

  // Ensure stop is part of the route
  const stopIndex = route.stops.findIndex(stop => stop.order._id.toString() === orderId);
  if (stopIndex === -1) throw new ApiError(status.NOT_FOUND, 'Order not found in route stops');

  // Reset all other nextDestination flags
  route.stops = route.stops.map((stop, index) => ({
    ...stop.toObject?.() || stop,
    nextDestination: index === stopIndex
  }));
  await route.save();
 
  io.to(`routeTracking-${route._id.toString()}`).emit("stopsData", { routeId: route._id, stops: route.stops });
 
  let customer = await Customer.findById(order.customer).select("fcm").lean();
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  }
 
  if (customer.fcm) {
    const title = "Your Order is nearby";
    let bodyText = "Your order is on the way and will be delivered soon.";
    const fcmToken = customer.fcm;
    const imgURL = "";
    
    // Send notification
    await sendNotification(title, bodyText, fcmToken, imgURL);  
  }
    
  return;
}; 

const deleteRoutesByVendorId = async (vendorId) => {
  // Check if vendor exists
  let vendor = await Admin.findById(vendorId).populate('user').lean();
  if (!vendor) {
    throw new ApiError(status.NOT_FOUND, 'Vendor not found');
  }

  const today = moment().tz('America/New_York');
  const startOfWeek = today.clone().startOf('isoWeek');
  const endOfWeek = startOfWeek.clone().add(6, 'days').endOf('day');

  // Check if pending routes exist for this week of this vendor
  const weekRoutes = await Route.find({
    createdAt: {
      $gte: startOfWeek.toDate(),
      $lte: endOfWeek.toDate(),
    },
    vendorId: vendor._id,
    status: 'pending' 
  }).lean();
  if (weekRoutes.length === 0) {
    throw new ApiError(status.NOT_FOUND, 'Pending Routes not found for this week.');
  }

  const routeIds = weekRoutes.map(route => route._id);
  
  // delete all week routes
  await Route.deleteMany({ _id: { $in: routeIds } });
  return;
};

 
module.exports = {
    createRoutes,
    createRoutesWithoutZones,
    queryRoutes,
    assignToRiders,
    unassignedZoneOrders,
    assignZoneToOrder,
    getRouteById,
    getRiderNewRoute,
    getCustomerNewRoute,
    getAllRoutesOfRider,
    updateRouteById,
    updateRouteStatus,
    updateOrderStatus, 
    nextDestination,
    deleteRoutesByVendorId
};
