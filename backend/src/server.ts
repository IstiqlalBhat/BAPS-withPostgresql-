import dotenv from 'dotenv';

// Initialize environment FIRST before importing anything that uses env vars
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectDatabase, sequelize } from './config/database';
import { config } from './config/auth';
import { errorHandler } from './api/middleware/error.middleware';
import { initializeUser } from './models/User';
import { initializeElement } from './models/Element';
import { initializePricing } from './models/Pricing';

// Initialize models with sequelize instance
initializeUser(sequelize);
initializeElement(sequelize);
initializePricing(sequelize);

// Routes
import authRoutes from './api/routes/auth.routes';
import elementRoutes from './api/routes/element.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: config.cors.origin, credentials: true })); // CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many authentication attempts, please try again later',
});

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/elements', elementRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        // Connect to database
        await connectDatabase();

        // Sync models (for development only)
        if (process.env.NODE_ENV === 'development') {
            const { sequelize } = await import('./config/database');
            await sequelize.sync({ alter: true });
            console.log('📦 Database models synchronized');
        }

        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔥 OpenAI integration: ${process.env.OPENAI_API_KEY ? 'enabled' : 'disabled'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
