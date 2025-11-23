const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');
const logger = require('../utils/logger');
const { auth, authorize } = require('../middleware/auth');

const GeneralContractor = db.GeneralContractor;
const User = db.User;

/**
 * @swagger
 * /api/gc:
 *   post:
 *     summary: Create a new General Contractor
 *     tags: [General Contractors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               registrationNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               website:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: General Contractor created successfully
 */
router.post('/', auth, authorize('GENERAL_CONTRACTOR', 'ADMIN'), [
  body('companyName').notEmpty(),
  body('address').optional(),
  body('city').optional(),
  body('state').optional(),
  body('zipCode').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const gc = await GeneralContractor.create({
      userId: req.user.id,
      ...req.body
    });

    logger.info(`General Contractor created: ${gc.id}`);

    res.status(201).json({
      message: 'General Contractor created successfully',
      data: gc
    });
  } catch (error) {
    logger.error('Create GC error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create General Contractor',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/gc:
 *   get:
 *     summary: List all General Contractors
 *     tags: [General Contractors]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of General Contractors
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const gcs = await GeneralContractor.findAndCountAll({
      include: [{ model: User, attributes: ['email', 'firstName', 'lastName', 'phone'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: gcs.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: gcs.rows
    });
  } catch (error) {
    logger.error('List GCs error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve General Contractors',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/gc/{id}:
 *   get:
 *     summary: Get General Contractor by ID
 *     tags: [General Contractors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: General Contractor found
 *       404:
 *         description: General Contractor not found
 */
router.get('/:id', async (req, res) => {
  try {
    const gc = await GeneralContractor.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['email', 'firstName', 'lastName', 'phone'] }]
    });

    if (!gc) {
      return res.status(404).json({
        error: {
          message: 'General Contractor not found',
          status: 404
        }
      });
    }

    res.json(gc);
  } catch (error) {
    logger.error('Get GC error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve General Contractor',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/gc/{id}:
 *   put:
 *     summary: Update General Contractor
 *     tags: [General Contractors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: General Contractor updated successfully
 */
router.put('/:id', auth, authorize('GENERAL_CONTRACTOR', 'ADMIN'), async (req, res) => {
  try {
    const gc = await GeneralContractor.findByPk(req.params.id);

    if (!gc) {
      return res.status(404).json({
        error: {
          message: 'General Contractor not found',
          status: 404
        }
      });
    }

    // Check authorization
    if (gc.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: {
          message: 'Not authorized to update this General Contractor',
          status: 403
        }
      });
    }

    await gc.update(req.body);

    logger.info(`General Contractor updated: ${gc.id}`);

    res.json({
      message: 'General Contractor updated successfully',
      data: gc
    });
  } catch (error) {
    logger.error('Update GC error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update General Contractor',
        status: 500
      }
    });
  }
});

module.exports = router;
