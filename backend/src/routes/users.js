const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');
const logger = require('../utils/logger');
const { auth, authorize } = require('../middleware/auth');

const User = db.User;

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    res.json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve profile',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', auth, [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('phone').optional().isString()
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

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    await user.update(req.body);

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update profile',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
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
 *         description: User found
 *       403:
 *         description: Insufficient permissions
 */
router.get('/:id', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    res.json(user);
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve user',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
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
 *         description: List of users
 */
router.get('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { role, limit = 10, offset = 0 } = req.query;
    const where = role ? { role } : {};

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: users.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: users.rows
    });
  } catch (error) {
    logger.error('List users error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve users',
        status: 500
      }
    });
  }
});

module.exports = router;
