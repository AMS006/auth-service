import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../types';
import createHttpError from 'http-errors';

export default (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as AuthRequest;
        const user = _req.auth;

        if (!user) {
            const error = createHttpError(401, 'Unauthorized');
            return next(error);
        }

        if (!roles.includes(user.role)) {
            const error = createHttpError(403, 'Forbidden');
            return next(error);
        }

        next();
    };
};
