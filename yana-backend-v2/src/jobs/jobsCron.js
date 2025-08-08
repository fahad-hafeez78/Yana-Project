const cron = require("node-cron");
const moment = require("moment-timezone");
const { Order, OrderPlacingDuration, Customer } = require("../models");
const logger = require("../config/logger");
const { sendNotification } = require("../utils/helper");
const { create } = require("../models/role.model");

const updateOrderStatusJob = () => {  
  cron.schedule("2 0 * * *", async () => {
    logger.info("Cron job started: Updating order statuses...");
    try {
      const orderPlacingDuration = await OrderPlacingDuration.findOne().lean();
      if (!orderPlacingDuration?.endDay) {
        logger.warn("Order placing duration not properly configured.");
        return;
      }

      const today = moment().tz("America/New_York"); 
      const yesterday = today.clone().subtract(1, "day").format("dddd");
      
      if (yesterday == orderPlacingDuration.endDay) { 
        const pendingOrders = await Order.find({ status: "pending" })
          .populate('customer', 'fcm')
          .lean();
  
        for (const order of pendingOrders) {
          // Update each order status to "active"
          await Order.updateOne(
            { _id: order._id },
            { $set: { status: "active" } }
          );

          if (order.customer?.fcm) {
            const title = "Your Weekly Order Has Been Confirmed!";
            const body = "Your order has been confirmed and will soon be delivered to you. Thanks for shopping with us! We hope you enjoy your meals this week.";
            const fcmToken = order.customer.fcm;
            const imgURL = "";

            // Send the notification
            await sendNotification(title, body, fcmToken, imgURL);
          }
        }  
      } 
      
      if (today.isoWeekday() === 1) {  // Check if today is Monday = 1
        // Calculate start of last week (Monday)
        const startOfLastWeek = today.clone().subtract(1, 'weeks').startOf('isoWeek');
        // Calculate end of last week (Sunday)
        const endOfLastWeek = startOfLastWeek.clone().add(6, 'days').endOf('day');

        const pendingOrders = await Order.find({ 
          status: "pending",
          createdAt: {
            $gte: startOfLastWeek.toDate(),
            $lte: endOfLastWeek.toDate()
          },
         }).populate('customer', 'fcm').lean();
 
        for (const order of pendingOrders) {
          // Update each order status to "active"
          await Order.updateOne(
            { _id: order._id },
            { $set: { status: "active" } }
          );

          if (order.customer?.fcm) {
            const title = "Your Weekly Order Has Been Confirmed!";
            const body = "Your order has been confirmed and will soon be delivered to you. Thanks for shopping with us! We hope you enjoy your meals this week.";
            const fcmToken = order.customer.fcm;
            const imgURL = "";

            // Send the notification
            await sendNotification(title, body, fcmToken, imgURL);
          }
        } 
      }

    } catch (error) {
      logger.error("Error updating order statuses:", error);
    }
  },
  {
    timezone: "America/New_York"
  });
};

const updateCustomerStatusJob = () => {
  cron.schedule("4 0 * * *", async () => {
    logger.info("Cron job started: Updating customer statuses...");

    try {
      const today = moment().tz("America/New_York").startOf("day").format("YYYY-MM-DD");
      const yesterday = moment().tz("America/New_York").subtract(1, "day").format("YYYY-MM-DD");

      const customers = await Customer.find({
        $or: [{ pauseStartDt: { $ne: null } }, { pauseEndDt: { $ne: null } }]
      });

      if (customers.length == 0) {
        logger.info("No customers with pause/resume dates. Exiting.");
        return;
      }

      const customersToPause = [];
      const customersToResume = [];

      customers.forEach((customer) => {
        const startDt = moment(customer.pauseStartDt).format("YYYY-MM-DD");
        const endDt = moment(customer.pauseEndDt).format("YYYY-MM-DD");

        // Check if the customer should be paused
        if (startDt === today) {
          customersToPause.push(customer);
        }
        
        // Check if the customer should be resumed (if yesterday was the pauseEndDt)
        if (endDt === yesterday) {
          customersToResume.push(customer);
        }
      });

      const bulkOps = [];
      const notifications = [];

      // Bulk operation to pause customers and send pause notification
      if (customersToPause.length > 0) {
        customersToPause.forEach((customer) => {
          const pauseEndDate = moment(customer.pauseEndDt).format("YYYY-MM-DD");

          // Add to bulk operation to pause
          bulkOps.push({
            updateOne: {
              filter: { _id: customer._id },
              update: { $set: { status: "inactive", pauseStartDt: null } }
            }
          });

          // Prepare the notification for pausing
          if (customer.fcm) {
            const title = "Your Account Has Been Paused!";
            const body = `Your account has been paused until ${pauseEndDate}. You will be able to place orders again after this date.`;
            const fcmToken = customer.fcm;
            const imgURL = "";

            // Send the notification
            notifications.push(sendNotification(title, body, fcmToken, imgURL));
            logger.info(`Notification sent to customer ${customer._id} regarding pause.`);
          }
        });
      }

      // Bulk operation to resume customers and send resume notification
      if (customersToResume.length > 0) {
        customersToResume.forEach((customer) => {
          // Add to bulk operation to resume
          bulkOps.push({
            updateOne: {
              filter: { _id: customer._id },
              update: { $set: { status: "active", pauseEndDt: null } }
            }
          });

          // Prepare the notification for resuming
          if (customer.fcm) {
            const title = "Your Account Is Now Active!";
            const body = "Your account is now active, and you can place orders again. Welcome back!";
            const fcmToken = customer.fcm;
            const imgURL = "";

            // Send the notification
            notifications.push(sendNotification(title, body, fcmToken, imgURL));
            logger.info(`Notification sent to customer ${customer._id} regarding resume.`);
          }
        });
      }

      // Execute bulk operations to update customer statuses
      if (bulkOps.length) {
        await Customer.bulkWrite(bulkOps);
        logger.info(`Successfully updated customer statuses — Paused: ${customersToPause.length}, Resumed: ${customersToResume.length}`);
      } else {
        logger.info("No updates needed today.");
      }

      // Wait for all notifications to be sent
      await Promise.all(notifications);

    } catch (error) {
      logger.error("Error updating customer statuses:", error);
    }
  },
  {
    timezone: "America/New_York"
  });
};

const sendOrderReminderJob = () => {
  cron.schedule("6 0 * * *", async () => {
    logger.info("Cron job started: Checking for customers who need a reminder...");

    try {
      // Fetch the order placing duration settings
      const orderPlacingDuration = await OrderPlacingDuration.findOne().lean();
      if (!orderPlacingDuration?.endDay) {
        logger.warn("Order placing duration not properly configured.");
        return;
      }

      const today = moment().tz("America/New_York").format("dddd");

      // Check if today is the last day to place orders
      if (today !== orderPlacingDuration.endDay) {
        logger.info("Today is not the last day to place orders.");
        return;
      }

      logger.info("Today is the last day to place orders. Sending reminders to customers who haven't placed an order.");

      const aaj = moment().tz("America/New_York");
      // Calculate start of week (Monday)
      const startOfWeek = aaj.clone().startOf('isoWeek');
      // Calculate end of week (Sunday)
      const endOfWeek = startOfWeek.clone().add(6, 'days').endOf('day'); 

      // Fetch customers who have pending orders
      const currentWeekOrders = await Order.find({
        createdAt: {
          $gte: startOfWeek.toDate(),
          $lte: endOfWeek.toDate()
        }
      }).lean();

      // Extract unique customer IDs
      const uniqueCustomerIDsOfOrders = [...new Set(currentWeekOrders.map(order => order.customer.toString()))];

      // Get customers who haven't ordered and have an FCM token
      const customersToRemind = await Customer.find({
        _id: { $nin: uniqueCustomerIDsOfOrders },
        fcm: { $exists: true, $nin: [null, ""] }
      }).lean(); 

      // Iterate through all customers and send reminders to those who haven't placed an order
      for (const customer of customersToRemind) {  
        if (customer.fcm) {
          const title = "Friendly Reminder!";
          const body = "As today is the last day, please do not forget to place your order before 05:30 PM.";
          const fcmToken = customer.fcm;
          const imgURL = "";  

          // Send the reminder notification
          await sendNotification(title, body, fcmToken, imgURL);
          logger.info(`Reminder sent to customer ${customer._id} (no pending order).`);
        } 
      }

    } catch (error) {
      logger.error("Error sending order reminder:", error);
    }
  },
  {
    timezone: "America/New_York"
  });
};

module.exports = { updateOrderStatusJob, updateCustomerStatusJob,sendOrderReminderJob };
