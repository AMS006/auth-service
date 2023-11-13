import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/userService';
import { validationResult } from 'express-validator';

import { Logger } from 'winston';

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
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            // this.logger.info("User has been created", { id: user.id });
            res.status(201).json(user);
        } catch (error) {
            next(error);
            return;
        }
    }
}
