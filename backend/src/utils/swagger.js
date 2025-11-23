const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BBAPS API Documentation',
      version: '1.0.0',
      description: 'API documentation for BBAPS - BIM and Blockchain-enabled Automatic Procurement System',
      contact: {
        name: 'Support',
        email: 'support@bbaps.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.bbaps.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'GENERAL_CONTRACTOR', 'SUBCONTRACTOR'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            projectCode: { type: 'string' },
            location: { type: 'string' },
            workType: { type: 'string' },
            scheduleFrom: { type: 'string', format: 'date-time' },
            scheduleTo: { type: 'string', format: 'date-time' },
            materialUnitCost: { type: 'number' },
            laborUnitCost: { type: 'number' },
            totalQuantity: { type: 'number' },
            totalConstructionCost: { type: 'number' },
            status: { type: 'string', enum: ['DRAFT', 'OPEN', 'MATCHING', 'AWARDED', 'COMPLETED', 'CANCELLED'] }
          }
        },
        TrustFactor: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            costConformity: { type: 'integer', minimum: 1, maximum: 10 },
            timeConformity: { type: 'integer', minimum: 1, maximum: 10 },
            qualityConformity: { type: 'integer', minimum: 1, maximum: 10 }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                status: { type: 'integer' }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/auth.js',
    './routes/users.js',
    './routes/generalContractors.js',
    './routes/subcontractors.js',
    './routes/projects.js',
    './routes/trustFactors.js',
    './routes/matches.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
