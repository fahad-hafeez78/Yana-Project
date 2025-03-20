import express from 'express'
import dotenv from 'dotenv'

import ordersRoutes from './src/routes/ordersRoutes.js'
import mealsRoutes from './src/routes/mealsRoutes.js'
import vendorsRoutes from './src/routes/vendorsRoutes.js'
import menusRoutes from './src/routes/menusRoutes.js'
import weeksAssignmentRoutes from './src/routes/weeksAssignmentRoutes.js'
import rolesRoutes from './src/routes/rolesRoutes.js'
import participantsRoutes from './src/routes/participantsRoutes.js'
import participantsChangesRoutes from './src/routes/participantsChangesRoutes.js'
import umsRoutes from './src/routes/umsRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
import keyRoutes from './src/routes/keyRoutes.js'

import { authenticateJWT } from './src/middleware/authTokens.js';
import cors from './src/middleware/cors.js'
import { errorHandler } from './src/middleware/errorHandler.js'
import connectToMongoDB from './src/config/db.js'
import { updateOrdersStatus } from './src/utils/Orders/updateOrdersStatus.js'

dotenv.config()

const app = express();
const port = process.env.PORT;

// Database connection
connectToMongoDB();

// Middleares
app.use(express.json())
app.use(cors)
updateOrdersStatus();

// Routes without JWT authentication
app.use('/getkeys', keyRoutes);
app.use('/api/v1/auth', authRoutes)

// JWT authentication
app.use('/api/v1', authenticateJWT);

// Routes
app.use('/api/v1/vendors', vendorsRoutes)
app.use('/api/v1/menus', menusRoutes)
app.use('/api/v1/roles', rolesRoutes)
app.use('/api/v1/orders', ordersRoutes)

app.use('/api/v1/meals', mealsRoutes)
app.use('/api/v1/weeksAssignment', weeksAssignmentRoutes)

app.use('/api/v1/participants', participantsRoutes)
app.use('/api/v1/participantsChanges', participantsChangesRoutes)

app.use('/api/v1/ums', umsRoutes)

app.use(errorHandler)

// Home route to test if the server is running
app.get('/', (req, res) => {
  res.send('Backend is running...')
})

app.listen(port, () => {
  console.log(`Yana backend is listening on port ${port}`)
})
