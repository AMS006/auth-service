import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants/intex';
import logger from '../config/logger';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        try {
            // Check if user already exists
            const user = await this.userRepository.findOne({
                where: { email: email },
            });

            if (user) {
                const err = createHttpError(400, 'Email already exists');
                throw err;
            }

            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Store user in database
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
        } catch (error) {
            logger.error('Some error', error);
            const err = createHttpError(
                500,
                'Failed to store data in database'
            );
            throw err;
        }
    }
}
