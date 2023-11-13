import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import 'reflect-metadata';

import authRouter from './router/auth';
const app = express();

app.use(express.json());

app.use('/auth', authRouter);

app.get('/', (req, res) => {
    res.status(200).send('Welcome to Auth Service 1');
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);

    const statusCode = err.statusCode || 500;
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
