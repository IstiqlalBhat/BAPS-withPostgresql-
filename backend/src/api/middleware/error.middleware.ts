import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 */
export const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', error);

    const status = error.status || error.statusCode || 500;
    const message = error.message || 'Internal server error';

    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
