const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');
const logger = require('../utils/logger');
const { auth, authorize } = require('../middleware/auth');

const TrustFactor = db.TrustFactor;
const Subcontractor = db.Subcontractor;
const GeneralContractor = db.GeneralContractor;

/**
 * @swagger
 * /api/trust-factors:
 *   post:
 *     summary: Set trust factor for a subcontractor
 *     tags: [Trust Factors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subcontractorId:
 *                 type: string
 *               costConformity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               timeConformity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               qualityConformity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trust factor set successfully
 *       400:
 *         description: Validation error or total exceeds 30
 */
router.post('/', auth, authorize('GENERAL_CONTRACTOR', 'ADMIN'), [
  body('subcontractorId').notEmpty(),
  body('costConformity').isInt({ min: 1, max: 10 }),
  body('timeConformity').isInt({ min: 1, max: 10 }),
  body('qualityConformity').isInt({ min: 1, max: 10 })
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

    const { subcontractorId, costConformity, timeConformity, qualityConformity, notes } = req.body;

    // Validate total score doesn't exceed 30
    const totalScore = costConformity + timeConformity + qualityConformity;
    if (totalScore > 30) {
      return res.status(400).json({
        error: {
          message: 'Total trust factor score cannot exceed 30',
          status: 400
        }
      });
    }

    // Check if subcontractor exists
    const sc = await Subcontractor.findByPk(subcontractorId);
    if (!sc) {
      return res.status(404).json({
        error: {
          message: 'Subcontractor not found',
          status: 404
        }
      });
    }

    // Get GC ID
    const gc = await GeneralContractor.findOne({ where: { userId: req.user.id } });
    if (!gc && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        error: {
          message: 'User must be a General Contractor to set trust factors',
          status: 400
        }
      });
    }

    const gcId = gc?.id || req.body.gcId;

    // Check if trust factor already exists
    const existingTF = await TrustFactor.findOne({
      where: {
        subcontractorId,
        gcId
      }
    });

    let trustFactor;
    if (existingTF) {
      // Update existing trust factor
      await existingTF.update({
        costConformity,
        timeConformity,
        qualityConformity,
        notes
      });
      trustFactor = existingTF;
    } else {
      // Create new trust factor
      trustFactor = await TrustFactor.create({
        subcontractorId,
        gcId,
        costConformity,
        timeConformity,
        qualityConformity,
        notes
      });
    }

    logger.info(`Trust factor set for subcontractor ${subcontractorId} by GC ${gcId}`);

    res.status(201).json({
      message: 'Trust factor set successfully',
      data: trustFactor
    });
  } catch (error) {
    logger.error('Set trust factor error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to set trust factor',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/trust-factors/{id}:
 *   get:
 *     summary: Get trust factor by ID
 *     tags: [Trust Factors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Trust factor found
 *       404:
 *         description: Trust factor not found
 */
router.get('/:id', async (req, res) => {
  try {
    const trustFactor = await TrustFactor.findByPk(req.params.id, {
      include: [
        { model: Subcontractor, attributes: ['id', 'companyName'] },
        { model: GeneralContractor, attributes: ['id', 'companyName'] }
      ]
    });

    if (!trustFactor) {
      return res.status(404).json({
        error: {
          message: 'Trust factor not found',
          status: 404
        }
      });
    }

    res.json({
      ...trustFactor.toJSON(),
      totalScore: trustFactor.getTotalScore()
    });
  } catch (error) {
    logger.error('Get trust factor error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve trust factor',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/trust-factors/subcontractor/{scId}:
 *   get:
 *     summary: Get all trust factors for a subcontractor
 *     tags: [Trust Factors]
 *     parameters:
 *       - in: path
 *         name: scId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of trust factors
 */
router.get('/subcontractor/:scId', async (req, res) => {
  try {
    const trustFactors = await TrustFactor.findAll({
      where: { subcontractorId: req.params.scId },
      include: [{ model: GeneralContractor, attributes: ['id', 'companyName'] }],
      order: [['createdAt', 'DESC']]
    });

    if (trustFactors.length === 0) {
      return res.json({
        total: 0,
        averageScore: 0,
        factors: []
      });
    }

    const scores = trustFactors.map(tf => ({
      ...tf.toJSON(),
      totalScore: tf.getTotalScore()
    }));

    const averageScore = scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length;

    res.json({
      total: scores.length,
      averageScore: Math.round(averageScore * 10) / 10,
      factors: scores
    });
  } catch (error) {
    logger.error('Get trust factors error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve trust factors',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/trust-factors/{id}:
 *   put:
 *     summary: Update trust factor
 *     tags: [Trust Factors]
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
 *               costConformity:
 *                 type: integer
 *               timeConformity:
 *                 type: integer
 *               qualityConformity:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trust factor updated successfully
 */
router.put('/:id', auth, authorize('GENERAL_CONTRACTOR', 'ADMIN'), async (req, res) => {
  try {
    const trustFactor = await TrustFactor.findByPk(req.params.id, {
      include: [{ model: GeneralContractor }]
    });

    if (!trustFactor) {
      return res.status(404).json({
        error: {
          message: 'Trust factor not found',
          status: 404
        }
      });
    }

    // Check authorization
    if (trustFactor.GeneralContractor.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: {
          message: 'Not authorized to update this trust factor',
          status: 403
        }
      });
    }

    // Validate total score if updating conformity scores
    if (req.body.costConformity || req.body.timeConformity || req.body.qualityConformity) {
      const cost = req.body.costConformity || trustFactor.costConformity;
      const time = req.body.timeConformity || trustFactor.timeConformity;
      const quality = req.body.qualityConformity || trustFactor.qualityConformity;

      if ((cost + time + quality) > 30) {
        return res.status(400).json({
          error: {
            message: 'Total trust factor score cannot exceed 30',
            status: 400
          }
        });
      }
    }

    await trustFactor.update(req.body);

    logger.info(`Trust factor updated: ${trustFactor.id}`);

    res.json({
      message: 'Trust factor updated successfully',
      data: trustFactor
    });
  } catch (error) {
    logger.error('Update trust factor error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update trust factor',
        status: 500
      }
    });
  }
});

module.exports = router;
