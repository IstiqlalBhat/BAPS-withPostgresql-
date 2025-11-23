const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models');
const logger = require('../utils/logger');
const { auth, authorize } = require('../middleware/auth');
const Papa = require('papaparse');

const Project = db.Project;
const GeneralContractor = db.GeneralContractor;
const ProjectMatch = db.ProjectMatch;

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectCode:
 *                 type: string
 *               location:
 *                 type: string
 *               workType:
 *                 type: string
 *               description:
 *                 type: string
 *               scheduleFrom:
 *                 type: string
 *                 format: date-time
 *               scheduleTo:
 *                 type: string
 *                 format: date-time
 *               materialUnitCost:
 *                 type: number
 *               laborUnitCost:
 *                 type: number
 *               totalQuantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post('/', auth, authorize('GENERAL_CONTRACTOR', 'ADMIN'), [
  body('projectCode').notEmpty().trim(),
  body('location').notEmpty(),
  body('workType').notEmpty(),
  body('scheduleFrom').isISO8601(),
  body('scheduleTo').isISO8601(),
  body('materialUnitCost').isDecimal(),
  body('laborUnitCost').isDecimal(),
  body('totalQuantity').isDecimal()
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

    const { projectCode } = req.body;

    // Check if project code already exists
    const existingProject = await Project.findOne({ where: { projectCode } });
    if (existingProject) {
      return res.status(409).json({
        error: {
          message: 'Project code already exists',
          status: 409
        }
      });
    }

    // Get GC ID
    const gc = await GeneralContractor.findOne({ where: { userId: req.user.id } });
    if (!gc && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        error: {
          message: 'User must be a General Contractor to create projects',
          status: 400
        }
      });
    }

    const gcId = gc?.id || req.body.gcId;

    const project = await Project.create({
      gcId,
      ...req.body
    });

    logger.info(`Project created: ${project.id}`);

    res.status(201).json({
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create project',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: status
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
 *         description: List of projects
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;
    const where = status ? { status } : {};

    const projects = await Project.findAndCountAll({
      where,
      include: [{ model: GeneralContractor, attributes: ['companyName'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: projects.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: projects.rows
    });
  } catch (error) {
    logger.error('List projects error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve projects',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Project found
 *       404:
 *         description: Project not found
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: GeneralContractor, attributes: ['companyName', 'id'] }]
    });

    if (!project) {
      return res.status(404).json({
        error: {
          message: 'Project not found',
          status: 404
        }
      });
    }

    res.json(project);
  } catch (error) {
    logger.error('Get project error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve project',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
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
 *         description: Project updated successfully
 */
router.put('/:id', auth, authorize('GENERAL_CONTRACTOR', 'ADMIN'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: GeneralContractor }]
    });

    if (!project) {
      return res.status(404).json({
        error: {
          message: 'Project not found',
          status: 404
        }
      });
    }

    // Check authorization
    if (project.GeneralContractor.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: {
          message: 'Not authorized to update this project',
          status: 403
        }
      });
    }

    await project.update(req.body);

    logger.info(`Project updated: ${project.id}`);

    res.json({
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update project',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/projects/{id}/import-bim:
 *   post:
 *     summary: Import BIM data from CSV
 *     tags: [Projects]
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
 *               csvContent:
 *                 type: string
 *                 description: CSV content as string
 *     responses:
 *       200:
 *         description: BIM data imported successfully
 */
router.post('/:id/import-bim', auth, authorize('GENERAL_CONTRACTOR', 'ADMIN'), async (req, res) => {
  try {
    const { csvContent } = req.body;

    if (!csvContent) {
      return res.status(400).json({
        error: {
          message: 'CSV content required',
          status: 400
        }
      });
    }

    const project = await Project.findByPk(req.params.id, {
      include: [{ model: GeneralContractor }]
    });

    if (!project) {
      return res.status(404).json({
        error: {
          message: 'Project not found',
          status: 404
        }
      });
    }

    // Check authorization
    if (project.GeneralContractor.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: {
          message: 'Not authorized to import BIM data',
          status: 403
        }
      });
    }

    // Parse CSV
    const parsedData = Papa.parse(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });

    if (parsedData.errors.length > 0) {
      return res.status(400).json({
        error: {
          message: 'CSV parsing error',
          details: parsedData.errors
        }
      });
    }

    // Process parsed data and update project
    const firstRow = parsedData.data[0];
    if (firstRow) {
      const updates = {};
      if (firstRow.material_cost) updates.materialUnitCost = firstRow.material_cost;
      if (firstRow.labor_cost) updates.laborUnitCost = firstRow.labor_cost;
      if (firstRow.quantity) updates.totalQuantity = firstRow.quantity;
      if (firstRow.location) updates.location = firstRow.location;
      if (firstRow.work_type) updates.workType = firstRow.work_type;

      await project.update(updates);
    }

    logger.info(`BIM data imported for project: ${project.id}`);

    res.json({
      message: 'BIM data imported successfully',
      rowsProcessed: parsedData.data.length,
      data: project
    });
  } catch (error) {
    logger.error('Import BIM error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to import BIM data',
        status: 500
      }
    });
  }
});

module.exports = router;
