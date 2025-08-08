const express = require('express');
const roleRoute = require('./role.route');
const keyRoute = require('./key.route');
const authRoute = require('./auth.route');
const umsRoute = require('./ums.route');
const vendorRoute = require('./vendor.route');
const mealRoute = require('./meal.route');
const mealAppRoute = require('./mealApp.route');
const menuRoute = require('./menu.route');
const reviewRoute = require('./review.route');
const reviewAppRoute = require('./reviewApp.route');
const reviewRiderRoute = require('./reviewRider.route');
const orderRoute = require('./order.route');
const chatRoute = require('./chat.route'); 
const chatAppRoute = require('./chatApp.route'); 
const chatRiderRoute = require('./chatRider.route');
const taskRoute = require('./task.route');
const ticketRoute = require('./ticket.route');
const ticketAppRoute = require('./ticketApp.route');
const orderAppRoute = require('./orderApp.route');
const orderRiderRoute = require('./orderRider.route');
const customerRoute = require('./customer.route');   
const customerAppRoute = require('./customerApp.route');  
const riderRoute = require('./rider.route'); 
const riderAppRoute = require('./riderApp.route'); 
const zoneRoute = require('./zone.route');
const routeRoute = require('./route.route');
const routeCustomerRoute = require('./routeCustomer.route');
const routeRiderRoute = require('./routeRider.route');
const claimRoute = require('./claim.route');
const { auth, isAny_Admin, isCustomer, isRider } = require('../../middlewares/auth');

const router = express.Router();

// Auth Routes for all users
router.use('/auth', authRoute);
router.use('/getkeys', keyRoute);

const adminRoutes = [
  { path: '/role', route: roleRoute },  
  { path: '/user', route: umsRoute },
  { path: '/vendor', route: vendorRoute },
  { path: '/meal', route: mealRoute },
  { path: '/menu', route: menuRoute },
  { path: '/customer', route: customerRoute },
  { path: '/review', route: reviewRoute },
  { path: '/order', route: orderRoute }, 
  { path: '/chat', route: chatRoute },  
  { path: '/task', route: taskRoute }, 
  { path: '/ticket', route: ticketRoute }, 
  { path: '/rider', route: riderRoute }, 
  // { path: '/zone', route: zoneRoute }, 
  { path: '/route', route: routeRoute }, 
  { path: '/claim', route: claimRoute }, 
];

const customerRoutes = [
  { path: '/', route: customerAppRoute }, 
  { path: '/order', route: orderAppRoute }, 
  { path: '/route', route: routeCustomerRoute },
  { path: '/meal', route: mealAppRoute },
  { path: '/review', route: reviewAppRoute },
  { path: '/ticket', route: ticketAppRoute },
  { path: '/chat', route: chatAppRoute },
];

const riderRoutes = [
  { path: '/', route: riderAppRoute },  
  { path: '/route', route: routeRiderRoute },
  { path: '/review', route: reviewRiderRoute },
  { path: '/order', route: orderRiderRoute }, 
  { path: '/chat', route: chatRiderRoute },
];


adminRoutes.forEach((route) => {
  router.use(`/admin${route.path}`, auth, isAny_Admin, route.route);
});

customerRoutes.forEach((route) => {
  router.use(`/customer${route.path}`, auth, isCustomer, route.route);
});

riderRoutes.forEach((route) => {
  router.use(`/rider${route.path}`, auth, isRider, route.route);
});


module.exports = router;
