import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../entity/User';
import { UpdateUserData, UserData } from '../types';
import createHttpError from 'http-errors';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        // Check if user already exists
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if (user) {
            const err = createHttpError(400, 'Email already exists');
            throw err;
        }

        try {
            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Store user in database
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
            });
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to store data in database'
            );
            throw err;
        }
    }

    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'password',
                'role',
            ],
        });
    }

    async comparePassword(password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword);
    }

    async findById(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            const err = createHttpError(404, 'User not found');
            throw err;
        }
        return user;
    }

    async getAll() {
        return await this.userRepository.find();
    }

    async getUserById(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            const err = createHttpError(404, 'User not found');
            throw err;
        }
        return user;
    }

    async update(id: number, { firstName, lastName, role }: UpdateUserData) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            const err = createHttpError(404, 'User not found');
            throw err;
        }
        return await this.userRepository.update(id, {
            firstName,
            lastName,
            role,
        });
    }

    async delete(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            const err = createHttpError(404, 'User not found');
            throw err;
        }
        return await this.userRepository.delete(id);
    }
}
