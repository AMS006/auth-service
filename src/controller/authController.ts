import { Logger } from 'winston';
import { JwtPayload } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';

import { UserService } from '../services/UserService';
import { TokenService } from '../services/TokenService';
import { AuthRequest, LoginUserRequest, RegisterUserRequest } from '../types';
import { Roles } from '../constants';

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
                role: Roles.CUSTOMER,
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

    async login(req: LoginUserRequest, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        // Validate the request
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        this.logger.info('Login user request', { email });
        try {
            const user = await this.userService.findByEmailWithPassword(email);

            if (!user) {
                const err = createHttpError(400, 'Invalid email or password');
                next(err);
                return;
            }
            const passwordMatch = await this.userService.comparePassword(
                password,
                user.password
            );

            if (!passwordMatch) {
                const err = createHttpError(400, 'Invalid email or password');
                next(err);
                return;
            }

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

            this.logger.info('User logged in successfully', { email });

            return res.status(200).json({ ...user, password: undefined });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));

        res.json({ ...user, password: undefined });
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };

            const user = await this.userService.findById(Number(req.auth.sub));

            if (!user) {
                const err = createHttpError(400, 'User not found');
                next(err);
                return;
            }
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

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

            return res.json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            this.logger.info('User logged out successfully', {
                id: req.auth.sub,
            });

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }
}
