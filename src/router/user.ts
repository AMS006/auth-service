import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import logger from '../config/logger';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserService } from '../services/UserService';
import authenticate from '../middlewares/authenticate';

import canAccess from '../middlewares/canAccess';
import { Roles } from '../constants';
import registerValidator from '../validators/register-validator';
import { UserController } from '../controllers/UserController';
import updateUserValidator from '../validators/update-user-validator';
import getUsersValidator from '../validators/get-users-validator';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const userController = new UserController(userService, logger);

router.post(
    '/',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next) as unknown as RequestHandler
);

router.get(
    '/',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    getUsersValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next) as unknown as RequestHandler
);

router.get(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getUserById(req, res, next) as unknown as RequestHandler
);

router.patch(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    updateUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.update(req, res, next) as unknown as RequestHandler
);

router.delete(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.delete(req, res, next) as unknown as RequestHandler
);

export default router;
