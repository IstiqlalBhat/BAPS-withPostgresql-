import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/auth';
import { JWTPayload, UserRole } from '@common/types/user.types';

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

/**
 * Middleware to verify JWT token from Authorization header
 */
export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const payload = jwt.verify(token, config.jwt.secret) as JWTPayload;
        req.user = payload;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Middleware factory to check user roles (RBAC)
 */
export const requireRole = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: roles,
                actual: req.user.role
            });
        }

        next();
    };
};
