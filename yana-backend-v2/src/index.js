const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const initializeRolesAndUser = require('./utils/initRolesAndUser.js');
const { updateOrderStatusJob, updateCustomerStatusJob, sendOrderReminderJob } = require('./jobs/jobsCron.js');
const { initializeSocket } = require('./utils/socket/socket.js');


let server = http.createServer(app);

mongoose.connect(config.mongoose.url).then(async () => {
  logger.info('Connected to MongoDB');

  // Initializing Collections
  await initializeRolesAndUser();

  // Cron jobs
  await updateOrderStatusJob(); 
  await updateCustomerStatusJob(); 
  await sendOrderReminderJob();

   
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
    initializeSocket(server); // Initialize Socket.IO
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
