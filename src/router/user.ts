import express, { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserService } from '../services/UserService';
import authenticate from '../middlewares/authenticate';

import canAccess from '../middlewares/canAccess';
import { Roles } from '../constants/intex';
import { UserController } from '../controller/UserController';
import registerValidator from '../validators/register-validator';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const userController = new UserController(userService, logger);

router.post(
    '/',
    authenticate,
    registerValidator,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next)
);

export default router;
