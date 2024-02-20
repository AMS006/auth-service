import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../entity/User';
import { UpdateUserData, UserData, UserQueryParams } from '../types';
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
            relations: {
                tenant: true,
            },
        });
    }

    async comparePassword(password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword);
    }

    async findById(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {
                tenant: true,
            },
        });
        if (!user) {
            const err = createHttpError(404, 'User not found');
            throw err;
        }
        return user;
    }

    async getAll(queryParams: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (queryParams.search) {
            queryBuilder.where(
                'user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search',
                { search: `%${queryParams.search}%` }
            );
        }

        if (queryParams.role && queryParams.role !== 'undefined') {
            queryBuilder.andWhere('user.role = :role', {
                role: queryParams.role,
            });
        }

        const result = await queryBuilder
            .leftJoinAndSelect('user.tenant', 'tenant')
            .skip((queryParams.page - 1) * queryParams.limit)
            .take(queryParams.limit)
            .orderBy('user.id', 'DESC')
            .getManyAndCount();

        return result;
    }

    async update(
        id: number,
        { firstName, lastName, role, tenantId }: UpdateUserData
    ) {
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
            tenant: tenantId ? { id: tenantId } : null,
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
