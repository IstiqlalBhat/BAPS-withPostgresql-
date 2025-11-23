import { Router } from 'express';
import { ElementController } from '../controllers/element.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@common/types/user.types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// List and create elements
router.get('/', ElementController.list);
router.post('/', requireRole(UserRole.GC_USER, UserRole.GC_ADMIN), ElementController.create);
router.post('/batch', requireRole(UserRole.GC_USER, UserRole.GC_ADMIN), ElementController.createBatch);

// Element operations
router.get('/:id', ElementController.getById);
router.get('/:id/suggest-price', ElementController.suggestPrice);
router.put('/:id/pricing', requireRole(UserRole.GC_ADMIN), ElementController.updatePricing);

export default router;
