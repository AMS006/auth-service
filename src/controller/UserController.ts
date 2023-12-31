import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { CreateUserRequest, UpdateUserRequest } from '../types';

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
        try {
            const users = await this.userService.getAll();
            res.status(200).json(users);
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
            const user = await this.userService.getUserById(Number(id));
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
        const { firstName, lastName, role } = req.body;
        try {
            await this.userService.update(Number(id), {
                firstName,
                lastName,
                role,
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
