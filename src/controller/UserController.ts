import { NextFunction, Response } from 'express';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { RegisterUserRequest } from '../types';
import { Roles } from '../constants/intex';

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger
    ) {}

    async create(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body;
        try {
            await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
            });
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            return next(error);
        }
    }
}
