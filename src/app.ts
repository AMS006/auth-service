import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import cookieParser from 'cookie-parser';
import 'reflect-metadata';

import authRouter from './router/auth';
import tenantRouter from './router/tenant';
import userRouter from './router/user';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
    res.status(200).send('Welcome to Auth Service 1');
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);

    const statusCode = err.statusCode || err.status || 500;
    return res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                message: err.message,
                path: '',
                location: '',
            },
        ],
    });
});

export default app;
