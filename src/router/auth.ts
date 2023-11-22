import express, { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import { TokenService } from '../services/TokenService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { RefreshToken } from '../entity/RefreshToken';
import registerValidator from '../validators/register-validator';
import loginValidator from '../validators/login-validator';
import { AuthController } from '../controller/AuthController';
import { UserService } from '../services/UserService';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);

const authController = new AuthController(userService, tokenService, logger);

router.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next)
);

router.post(
    '/login',
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next)
);

export default router;
