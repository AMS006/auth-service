import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants/intex';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
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
        try {
            // Store user in database
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to store data in database'
            );
            throw err;
        }
    }

    async login({ email, password }: UserData) {
        // Check if user exists
        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            const err = createHttpError(400, 'Invalid email or password');
            throw err;
        }

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            const err = createHttpError(400, 'Invalid email or password');
            throw err;
        }

        return user;
    }
}
