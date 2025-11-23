const express = require('express');
const router = express.Router();
const db = require('../models');
const logger = require('../utils/logger');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

const Project = db.Project;
const ProjectMatch = db.ProjectMatch;
const ProjectWinner = db.ProjectWinner;
const Subcontractor = db.Subcontractor;
const SubcontractorData = db.SubcontractorData;
const TrustFactor = db.TrustFactor;
const GeneralContractor = db.GeneralContractor;

// Helper function to check schedule overlap
function checkScheduleOverlap(projectFrom, projectTo, scFrom, scTo) {
  return !(projectTo < scFrom || projectFrom > scTo);
}

/**
 * @swagger
 * /api/matches/projects/{projectId}/find:
 *   get:
 *     summary: Find matching subcontractors for a project
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of matching subcontractors
 */
router.get('/projects/:projectId/find', auth, authorize('GENERAL_CONTRACTOR', 'ADMIN'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId, {
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
          message: 'Not authorized to view matches for this project',
          status: 403
        }
      });
    }

    // Find all subcontractors with availability data
    const scDataList = await SubcontractorData.findAll({
      include: [{
        model: Subcontractor,
        include: [{ model: db.User, attributes: ['email', 'firstName', 'lastName'] }]
      }],
      where: {
        workType: project.workType,
        location: project.location
      }
    });

    // Filter by schedule overlap and calculate match scores
    const matches = [];

    for (const scData of scDataList) {
      const scheduleMatch = checkScheduleOverlap(
        new Date(project.scheduleFrom),
        new Date(project.scheduleTo),
        new Date(scData.availabilityFrom),
        new Date(scData.availabilityTo)
      );

      if (!scheduleMatch) continue;

      // Get trust score
      const trustFactors = await TrustFactor.findAll({
        where: {
          subcontractorId: scData.subcontractorId,
          gcId: project.gcId
        }
      });

      let trustScore = 0;
      if (trustFactors.length > 0) {
        trustScore = trustFactors[0].getTotalScore();
      }

      // Calculate cost estimate
      const costPerSqm = parseFloat(scData.materialCostPerSqm) + parseFloat(scData.laborCostPerSqm);
      const costEstimate = costPerSqm * parseFloat(project.totalQuantity);

      // Calculate match score (0-100)
      // 70% trust factor, 30% cost competitiveness
      const maxTrust = 30;
      const trustComponent = (trustScore / maxTrust) * 70;

      // Cost competitiveness (lower is better)
      const baselineCost = parseFloat(project.totalConstructionCost);
      const costDiff = Math.abs(costEstimate - baselineCost);
      const costComponent = Math.max(0, 30 - (costDiff / baselineCost) * 30);

      const matchScore = trustComponent + costComponent;

      matches.push({
        subcontractorId: scData.subcontractorId,
        scDataId: scData.id,
        companyName: scData.Subcontractor.companyName,
        location: scData.location,
        workType: scData.workType,
        materialCostPerSqm: parseFloat(scData.materialCostPerSqm),
        laborCostPerSqm: parseFloat(scData.laborCostPerSqm),
        costEstimate: Math.round(costEstimate * 100) / 100,
        trustScore,
        scheduleMatch,
        locationMatch: scData.location === project.location,
        matchScore: Math.round(matchScore * 100) / 100
      });
    }

    // Sort by match score (descending)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    logger.info(`Found ${matches.length} matching subcontractors for project ${project.id}`);

    res.json({
      projectId: project.id,
      projectCode: project.projectCode,
      totalMatches: matches.length,
      matches
    });
  } catch (error) {
    logger.error('Find matches error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to find matches',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/matches/projects/{projectId}/select-winner:
 *   post:
 *     summary: Select winner for a project
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               subcontractorId:
 *                 type: string
 *               materialCost:
 *                 type: number
 *               laborCost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Winner selected successfully
 */
router.post('/projects/:projectId/select-winner', auth, authorize('GENERAL_CONTRACTOR', 'ADMIN'), async (req, res) => {
  try {
    const { subcontractorId, materialCost, laborCost } = req.body;

    if (!subcontractorId || materialCost === undefined || laborCost === undefined) {
      return res.status(400).json({
        error: {
          message: 'subcontractorId, materialCost, and laborCost are required',
          status: 400
        }
      });
    }

    const project = await Project.findByPk(req.params.projectId, {
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
          message: 'Not authorized to select winner for this project',
          status: 403
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

    // Check if winner already exists
    const existingWinner = await ProjectWinner.findOne({
      where: { projectId: req.params.projectId }
    });

    if (existingWinner) {
      return res.status(400).json({
        error: {
          message: 'Winner already selected for this project',
          status: 400
        }
      });
    }

    // Create winner record
    const winner = await ProjectWinner.create({
      projectId: req.params.projectId,
      subcontractorId,
      gcId: project.gcId,
      materialCost,
      laborCost
    });

    // Update project status
    await project.update({ status: 'AWARDED' });

    logger.info(`Winner selected for project ${project.id}: SC ${subcontractorId}`);

    res.status(201).json({
      message: 'Winner selected successfully',
      data: winner
    });
  } catch (error) {
    logger.error('Select winner error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to select winner',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/matches/projects/{projectId}/winner:
 *   get:
 *     summary: Get winner for a project
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Winner details
 *       404:
 *         description: No winner selected yet
 */
router.get('/projects/:projectId/winner', async (req, res) => {
  try {
    const winner = await ProjectWinner.findOne({
      where: { projectId: req.params.projectId },
      include: [
        { model: Project, attributes: ['projectCode', 'location', 'workType'] },
        { model: Subcontractor, attributes: ['id', 'companyName'] },
        { model: GeneralContractor, attributes: ['id', 'companyName'] }
      ]
    });

    if (!winner) {
      return res.status(404).json({
        error: {
          message: 'No winner selected for this project yet',
          status: 404
        }
      });
    }

    res.json(winner);
  } catch (error) {
    logger.error('Get winner error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve winner',
        status: 500
      }
    });
  }
});

/**
 * @swagger
 * /api/matches/gc/{gcId}/summary:
 *     summary: Get matching summary for a General Contractor
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: gcId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Matching summary
 */
router.get('/gc/:gcId/summary', async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { gcId: req.params.gcId },
      attributes: ['id', 'projectCode', 'status']
    });

    const summary = {
      gcId: req.params.gcId,
      totalProjects: projects.length,
      projectsWithWinners: 0,
      projectsPending: 0,
      projects: []
    };

    for (const project of projects) {
      const winner = await ProjectWinner.findOne({
        where: { projectId: project.id }
      });

      const projectData = {
        projectId: project.id,
        projectCode: project.projectCode,
        status: project.status,
        hasWinner: !!winner
      };

      summary.projects.push(projectData);

      if (winner) {
        summary.projectsWithWinners++;
      } else {
        summary.projectsPending++;
      }
    }

    res.json(summary);
  } catch (error) {
    logger.error('Get GC summary error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve summary',
        status: 500
      }
    });
  }
});

module.exports = router;
