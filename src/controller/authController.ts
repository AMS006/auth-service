import { Logger } from 'winston';
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';

import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { TokenService } from '../services/TokenService';

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            });

            const accessToken = this.tokenService.generateAccessToken(payload);

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
