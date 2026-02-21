const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const vehicleRoutes = require('./routes/vehicles');
const tripRoutes = require('./routes/trips');
const maintenanceRoutes = require('./routes/maintenance');
const expenseRoutes = require('./routes/expenses');
const driverRoutes = require('./routes/drivers');
const analyticsRoutes = require('./routes/analytics');
const seedData = require('./utils/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FleetFlow API is running',
        timestamp: new Date().toISOString()
    });
});

// Debug: list registered routes
const listRoutes = () => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push(`${Object.keys(middleware.route.methods).join(',')} ${middleware.route.path}`);
        } else if (middleware.name === 'router' && middleware.handle.stack) {
            const prefix = middleware.regexp.source
                .replace('\\/?(?=\\/|$)', '')
                .replace(/\\\//g, '/')
                .replace('^', '')
                .replace('$', '');
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push(`${Object.keys(handler.route.methods).join(',')} ${prefix}${handler.route.path}`);
                }
            });
        }
    });
    console.log('📍 Registered routes:', routes);
};

// Start server
const startServer = async () => {
    await connectDB();
    await seedData();

    listRoutes();

    app.listen(PORT, () => {
        console.log(`🚀 FleetFlow Backend running on http://localhost:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
};

startServer();
