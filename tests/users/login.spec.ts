import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { isJWT } from '../utils';
import { Headers } from '../../src/types';
import { RefreshToken } from '../../src/entity/RefreshToken';
import bcrypt from 'bcryptjs';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

describe('POST /auth/login', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('given body fileds are valid', () => {
        it('should return 200 status code when we login user with correct credentials', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const useeRepository = connection.getRepository(User);

            await useeRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return 400 status code when we login user with incorrect credentials', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const useeRepository = connection.getRepository(User);

            await useeRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: 'test1@gmail.com', password: '123456789' });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return refresh and access tokens in cookie', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const useeRepository = connection.getRepository(User);

            await useeRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            // Assert
            const cookies = (response.headers as Headers)['set-cookie'] || [];
            let accessToken: string | null = null;
            let refreshToken: string | null = null;
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });

        it('should store refresh token in database', async () => {
            /// Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const useeRepository = connection.getRepository(User);

            await useeRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            // Assert
            const refreshTokenRepository =
                connection.getRepository(RefreshToken);

            const tokens = await refreshTokenRepository
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();
            expect(tokens).toHaveLength(1);
        });

        it('should return user id in response body', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const useeRepository = connection.getRepository(User);

            await useeRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            // Assert
            expect(response.body).toHaveProperty('id');
            expect((response.body as { id: string }).id).toBe(
                (response.body as { id: string }).id
            );
        });
    });

    describe('given body fileds are missing', () => {
        it('should return 400 status code if email is missing', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const useeRepository = connection.getRepository(User);

            await useeRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: '', password: userData.password });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 status code if password is missing', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const useeRepository = connection.getRepository(User);

            await useeRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: '' });

            // Assert
            expect(response.statusCode).toBe(400);
        });
    });
});
