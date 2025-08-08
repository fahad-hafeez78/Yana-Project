const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean'); 
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors'); 
const cookieParser = require('cookie-parser');
const { status } = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan'); 
const { authLimiter, blockedIps } = require('./middlewares/rateLimiter');
const routes = require('./routes/v2');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError'); 

const app = express();
app.set('trust proxy', 1);

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: '100mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
const allowedOrigins = [
  'https://beta.physicianmarketing.us',
  'http://localhost:5173',
  'http://192.168.18.7:3001',
  'http://192.168.10.140:3001',
  'http://192.168.18.105:3000',  
  'http://192.168.10.71:3000', 
];
const corsOptions = {
  origin: (origin, callback) => {
     // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);  
    } else {
      callback(new Error('Not allowed by CORS'));  
    }
  },
  optionsSuccessStatus: 200,  // For legacy browser support
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true   // Allow cookies and auth headers
};
app.use(cors(corsOptions)); 

// ✅ Block abusive IPs early before anything else
app.use((req, res, next) => {
  // console.log(`Current IP: ${req.ip}`);
  // console.log(`blockedIps: ${Array.from(blockedIps).join(', ')}`);
  const ip = req.ip;
  if (blockedIps.has(ip)) {
    return res.status(403).json({ message: 'Too many login attempts. You are temporarily blocked.' });
  }
  next();
});
  
// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v2/auth', authLimiter);
}

// v2 api routes
app.use('/v2', routes);
  
// define root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(status.NOT_FOUND, 'API Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
