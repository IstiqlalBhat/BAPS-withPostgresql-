const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const db = require('./models');
const logger = require('./utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/gc', require('./routes/generalContractors'));
app.use('/api/sc', require('./routes/subcontractors'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/trust-factors', require('./routes/trustFactors'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/elements', require('./routes/elements'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500
    }
  });
});

// Database sync and server start
const PORT = process.env.PORT || 5000;

db.sequelize.sync({ alter: true }).then(() => {
  logger.info('Database synced successfully');
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API Documentation: http://localhost:${PORT}/api/docs`);
  });
}).catch(err => {
  logger.error('Database sync error:', err);
  process.exit(1);
});

module.exports = app;
