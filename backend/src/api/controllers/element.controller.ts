import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Element } from '../../models/Element';
import { Pricing } from '../../models/Pricing';
import { OpenAIService } from '../../services/openai.service';
import { CreateElementRequest } from '@common/types/element.types';

export class ElementController {
    /**
     * GET /elements - List all elements
     */
    static async list(req: AuthRequest, res: Response) {
        try {
            const elements = await Element.findAll({
                order: [['createdAt', 'DESC']],
            });
            res.json({ elements });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /elements - Create element from BIM data
     */
    static async create(req: AuthRequest, res: Response) {
        try {
            const data: CreateElementRequest = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const element = await Element.create({
                ...data,
                createdBy: userId,
            });

            res.status(201).json({ element });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /elements/:id - Get element by ID
     */
    static async getById(req: AuthRequest, res: Response) {
        try {
            const element = await Element.findByPk(req.params.id);

            if (!element) {
                return res.status(404).json({ error: 'Element not found' });
            }

            res.json({ element });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * PUT /elements/:id/pricing - Update pricing for element
     */
    static async updatePricing(req: AuthRequest, res: Response) {
        try {
            const { unitPrice, currency = 'USD', aiSuggested = false } = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const element = await Element.findByPk(req.params.id);
            if (!element) {
                return res.status(404).json({ error: 'Element not found' });
            }

            const totalPrice = unitPrice * parseFloat(element.quantity.toString());

            const pricing = await Pricing.create({
                elementId: element.id,
                unitPrice,
                totalPrice,
                currency,
                aiSuggested,
                createdBy: userId,
            });

            res.json({ pricing });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /elements/:id/suggest-price - Get AI pricing suggestion
     */
    static async suggestPrice(req: AuthRequest, res: Response) {
        try {
            const element = await Element.findByPk(req.params.id);
            if (!element) {
                return res.status(404).json({ error: 'Element not found' });
            }

            const suggestion = await OpenAIService.suggestPricing({
                name: element.name,
                category: element.category,
                quantity: parseFloat(element.quantity.toString()),
                unit: element.unit,
                properties: element.properties,
            });

            res.json({ suggestion });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
