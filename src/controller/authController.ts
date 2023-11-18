import fs from 'fs';
import path from 'path';
import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/userService';
import { validationResult } from 'express-validator';
import { JwtPayload, sign } from 'jsonwebtoken';

import { Logger } from 'winston';
import { Config } from '../config';

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction
    ) {
        const { firstName, lastName, email, password } = req.body;

        // Validate the request
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        try {
            this.logger.info('Create new user request', { email });
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('User created successfully', { email });

            const privateKey = fs.readFileSync(
                path.join(__dirname, '../../certs/private.pem')
            );

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };
            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'auth-service',
            });

            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'auth-service',
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });
            res.status(201).json(user);
        } catch (error) {
            next(error);
            return;
        }
    }
}
