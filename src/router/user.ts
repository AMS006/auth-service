import express, { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserService } from '../services/UserService';
import authenticate from '../middlewares/authenticate';

import canAccess from '../middlewares/canAccess';
import { Roles } from '../constants';
import registerValidator from '../validators/register-validator';
import { UserController } from '../controllers/UserController';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const userController = new UserController(userService, logger);

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next)
);

router.get(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next)
);

router.get(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getUserById(req, res, next)
);

router.patch(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.update(req, res, next)
);

router.delete(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.delete(req, res, next)
);

export default router;
