import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Element } from '../../models/Element';
import { Pricing } from '../../models/Pricing';
import { OpenAIService } from '../../services/openai.service';
import { CreateElementRequest } from '@common/types/element.types';

export class ElementController {
    /**
     * GET /elements - List all elements with pagination
     */
    static async list(req: AuthRequest, res: Response) {
        try {
            // Get pagination parameters from query
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
            const offset = (page - 1) * limit;

            const { count, rows } = await Element.findAndCountAll({
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            res.json({
                elements: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    pages: Math.ceil(count / limit)
                }
            });
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

            // Validate required fields
            if (!data.name || !data.category || !data.quantity || !data.unit) {
                return res.status(400).json({
                    error: 'Missing required fields: name, category, quantity, unit'
                });
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
     * POST /elements/batch - Create multiple elements from BIM data
     */
    static async createBatch(req: AuthRequest, res: Response) {
        try {
            const elements: CreateElementRequest[] = req.body.elements;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!Array.isArray(elements) || elements.length === 0) {
                return res.status(400).json({
                    error: 'Invalid request: elements array is required and must not be empty'
                });
            }

            // Validate all elements have required fields
            for (const element of elements) {
                if (!element.name || !element.category || !element.quantity || !element.unit) {
                    return res.status(400).json({
                        error: 'Missing required fields in one or more elements: name, category, quantity, unit'
                    });
                }
            }

            // Add createdBy to all elements
            const elementsWithUser = elements.map(el => ({
                ...el,
                createdBy: userId
            }));

            // Batch insert using bulkCreate for better performance
            const createdElements = await Element.bulkCreate(elementsWithUser);

            res.status(201).json({
                message: `Successfully created ${createdElements.length} elements`,
                elements: createdElements
            });
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
