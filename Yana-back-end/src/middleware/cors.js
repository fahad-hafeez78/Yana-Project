import cors from 'cors';

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://192.168.18.105:3000',
    'http://192.137.123.100:3000',
    'http://192.168.18.130:3000',
    'https://yana.physicianmarketing.us',
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['*', 'Refresh-Token'],
    credentials: true,
    exposedHeaders: ['Authorization','refresh-token'],
};

export default cors(corsOptions);
