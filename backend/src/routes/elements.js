const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');
const logger = require('../utils/logger');
const { auth, authorize } = require('../middleware/auth');

const Element = db.Element;

/**
 * @swagger
 * /api/elements:
 *   post:
 *     summary: Create a new element (GC only)
 *     tags: [Elements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               properties:
 *                 type: object
 *               bimMetadata:
 *                 type: object
 *               projectId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Element created successfully
 */
router.post('/', auth, authorize('GENERAL_CONTRACTOR', 'GC_USER', 'GC_ADMIN', 'ADMIN'), [
    body('name').notEmpty(),
    body('category').notEmpty(),
    body('quantity').isNumeric(),
    body('unit').notEmpty()
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

        const element = await Element.create({
            createdBy: req.user.id,
            ...req.body
        });

        logger.info(`Element created: ${element.id}`);

        res.status(201).json({
            message: 'Element created successfully',
            data: element
        });
    } catch (error) {
        logger.error('Create element error:', error);
        res.status(500).json({
            error: {
                message: 'Failed to create element',
                status: 500
            }
        });
    }
});

/**
 * @swagger
 * /api/elements:
 *   get:
 *     summary: List all elements
 *     tags: [Elements]
 *     responses:
 *       200:
 *         description: List of elements
 */
router.get('/', auth, async (req, res) => {
    try {
        const elements = await Element.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json(elements);
    } catch (error) {
        logger.error('List elements error:', error);
        res.status(500).json({
            error: {
                message: 'Failed to retrieve elements',
                status: 500
            }
        });
    }
});

module.exports = router;
