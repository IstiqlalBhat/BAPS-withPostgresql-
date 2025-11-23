const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');
const logger = require('../utils/logger');
const { auth, authorize } = require('../middleware/auth');

const Subcontractor = db.Subcontractor;
const SubcontractorData = db.SubcontractorData;
const User = db.User;
const TrustFactor = db.TrustFactor;
const { sequelize } = db;

/**
 * @swagger
 * /api/sc:
 *   post:
 *     summary: Create a new Subcontractor
 *     tags: [Subcontractors]
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
 *         description: Subcontractor created successfully
 */
router.post('/', auth, authorize('SUBCONTRACTOR', 'ADMIN'), [
  body('companyName').notEmpty(),
  body('address').optional(),
  body('city').optional()
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

    const sc = await Subcontractor.create({
      userId: req.user.id,
      ...req.body
    });

    logger.info(`Subcontractor created: ${sc.id}`);

    res.status(201).json({
      message: 'Subcontractor created successfully',
      data: sc
    });
  } catch (error) {
    logger.error('Create SC error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create Subcontractor',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/sc:
 *   get:
 *     summary: List all Subcontractors
 *     tags: [Subcontractors]
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
 *         description: List of Subcontractors
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const scs = await Subcontractor.findAndCountAll({
      include: [{ model: User, attributes: ['email', 'firstName', 'lastName', 'phone'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: scs.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: scs.rows
    });
  } catch (error) {
    logger.error('List SCs error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve Subcontractors',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/sc/{id}:
 *   get:
 *     summary: Get Subcontractor by ID
 *     tags: [Subcontractors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Subcontractor found
 *       404:
 *         description: Subcontractor not found
 */
router.get('/:id', async (req, res) => {
  try {
    const sc = await Subcontractor.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['email', 'firstName', 'lastName', 'phone'] },
        { model: SubcontractorData, order: [['createdAt', 'DESC']] }
      ]
    });

    if (!sc) {
      return res.status(404).json({
        error: {
          message: 'Subcontractor not found',
          status: 404
        }
      });
    }

    // Calculate trust score
    const trustFactors = await TrustFactor.findAll({
      where: { subcontractorId: sc.id }
    });

    const totalScore = trustFactors.length > 0
      ? trustFactors.reduce((sum, tf) => sum + tf.getTotalScore(), 0) / trustFactors.length
      : null;

    res.json({
      ...sc.toJSON(),
      trustScore: totalScore,
      trustFactorCount: trustFactors.length
    });
  } catch (error) {
    logger.error('Get SC error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve Subcontractor',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/sc/{id}:
 *   put:
 *     summary: Update Subcontractor
 *     tags: [Subcontractors]
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
 *         description: Subcontractor updated successfully
 */
router.put('/:id', auth, authorize('SUBCONTRACTOR', 'ADMIN'), async (req, res) => {
  try {
    const sc = await Subcontractor.findByPk(req.params.id);

    if (!sc) {
      return res.status(404).json({
        error: {
          message: 'Subcontractor not found',
          status: 404
        }
      });
    }

    // Check authorization
    if (sc.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: {
          message: 'Not authorized to update this Subcontractor',
          status: 403
        }
      });
    }

    await sc.update(req.body);

    logger.info(`Subcontractor updated: ${sc.id}`);

    res.json({
      message: 'Subcontractor updated successfully',
      data: sc
    });
  } catch (error) {
    logger.error('Update SC error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update Subcontractor',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/sc/{id}/availability:
 *   post:
 *     summary: Add availability and cost data for Subcontractor
 *     tags: [Subcontractors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availabilityFrom:
 *                 type: string
 *                 format: date-time
 *               availabilityTo:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               workType:
 *                 type: string
 *               materialCostPerSqm:
 *                 type: number
 *               laborCostPerSqm:
 *                 type: number
 *               maximumCapacity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Availability data added successfully
 */
router.post('/:id/availability', auth, authorize('SUBCONTRACTOR', 'ADMIN'), [
  body('availabilityFrom').isISO8601(),
  body('availabilityTo').isISO8601(),
  body('location').notEmpty(),
  body('workType').notEmpty(),
  body('materialCostPerSqm').isDecimal(),
  body('laborCostPerSqm').isDecimal()
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

    const sc = await Subcontractor.findByPk(req.params.id);

    if (!sc) {
      return res.status(404).json({
        error: {
          message: 'Subcontractor not found',
          status: 404
        }
      });
    }

    // Check authorization
    if (sc.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: {
          message: 'Not authorized to add availability data',
          status: 403
        }
      });
    }

    const scData = await SubcontractorData.create({
      subcontractorId: req.params.id,
      ...req.body
    });

    logger.info(`Subcontractor availability added: ${scData.id}`);

    res.status(201).json({
      message: 'Availability data added successfully',
      data: scData
    });
  } catch (error) {
    logger.error('Add availability error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to add availability data',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/sc/{id}/trust-score:
 *   get:
 *     summary: Get trust score for Subcontractor
 *     tags: [Subcontractors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Trust score retrieved
 */
router.get('/:id/trust-score', async (req, res) => {
  try {
    const trustFactors = await TrustFactor.findAll({
      where: { subcontractorId: req.params.id }
    });

    if (trustFactors.length === 0) {
      return res.json({
        subcontractorId: req.params.id,
        averageTrustScore: 0,
        totalFactors: 0,
        factors: []
      });
    }

    const scores = trustFactors.map(tf => ({
      id: tf.id,
      gcId: tf.gcId,
      costConformity: tf.costConformity,
      timeConformity: tf.timeConformity,
      qualityConformity: tf.qualityConformity,
      totalScore: tf.getTotalScore()
    }));

    const averageScore = scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length;

    res.json({
      subcontractorId: req.params.id,
      averageTrustScore: Math.round(averageScore * 10) / 10,
      totalFactors: scores.length,
      factors: scores
    });
  } catch (error) {
    logger.error('Get trust score error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve trust score',
        status: 500
      }
    });
  }
});

module.exports = router;
