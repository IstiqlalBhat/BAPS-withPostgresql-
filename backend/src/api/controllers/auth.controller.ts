import { Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, RegisterRequest } from '../../../../common/types/user.types';

export class AuthController {
    /**
     * POST /auth/register
     */
    static async register(req: Request, res: Response) {
        try {
            const data: RegisterRequest = req.body;
            const result = await AuthService.register(data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    /**
     * POST /auth/login
     */
    static async login(req: Request, res: Response) {
        try {
            const data: LoginRequest = req.body;
            const result = await AuthService.login(data);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    /**
     * GET /auth/me - Get current user (requires authentication)
     */
    static async getCurrentUser(req: any, res: Response) {
        try {
            res.json({ user: req.user });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
