import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import {
    CreateUserRequest,
    UpdateUserRequest,
    UserQueryParams,
} from '../types';
import { UserService } from '../services/UserService';
import { matchedData } from 'express-validator';

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger
    ) {}

    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password, role, tenantId } =
            req.body;
        try {
            await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });

            this.logger.info('User created successfully', { email });
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            return next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validateQuery = matchedData(req, { onlyValidData: true });
        try {
            const [users, count] = await this.userService.getAll(
                validateQuery as UserQueryParams
            );

            res.status(200).json({
                users,
                count,
                page: validateQuery.page as number,
                limit: validateQuery.limit as number,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const _id = Number(id);
        if (isNaN(_id)) {
            return next(new Error('Invalid User Id'));
        }
        try {
            const user = await this.userService.findById(Number(id));
            if (!user) {
                return next(new Error('User not found'));
            }
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        const { id } = req.params;
        const _id = Number(id);
        if (isNaN(_id)) {
            return next(new Error('Invalid User Id'));
        }
        const { firstName, lastName, role, tenantId } = req.body;
        // console.log(req.body, "In User Controller")
        try {
            await this.userService.update(Number(id), {
                firstName,
                lastName,
                role,
                tenantId,
            });
            res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const _id = Number(id);
        if (isNaN(_id)) {
            return next(new Error('Invalid User Id'));
        }
        try {
            await this.userService.delete(Number(id));
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}
