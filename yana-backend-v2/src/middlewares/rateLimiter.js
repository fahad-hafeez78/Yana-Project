const rateLimit = require('express-rate-limit');
const { status } = require('http-status');
const ApiError = require('../utils/ApiError');

let blockedIps = new Set();
let limiterStore;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  store: limiterStore = new rateLimit.MemoryStore(),
  handler: (req, res, next, options) => {
    const ip = req.ip; 
    if (!blockedIps.has(ip)) {
      blockedIps.add(ip);
      // Unblock IP after 30 minutes
      setTimeout(() => {
        blockedIps.delete(ip);
        limiterStore.resetKey(ip);
        console.log(`✅ IP ${ip} unblocked after 1 minutes.`);
      }, 30 * 60 * 1000);  // blocked for 30 minutes
      console.log(`IP ${ip} blocked due to too many login attempts.`); 
    }
    return next(new ApiError(status.TOO_MANY_REQUESTS, 'Too many login attempts. You are blocked for some time.'));
  }
});

module.exports = {
  authLimiter,
  blockedIps
};
