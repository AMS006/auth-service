import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { isJWT } from '../utils';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { AppDataSource } from '../../src/config/data-source';
import { RefreshToken } from '../../src/entity/RefreshToken';
import { Headers } from '../../src/types';

describe('POST auth/register', () => {
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

    describe('Given all Fields', () => {
        it('should return 201', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.status).toBe(201);
        });

        it('should return valid json', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(
                (response.headers as Record<string, string>)['content-type']
            ).toEqual(expect.stringContaining('json'));
        });

        it('should persist user in database', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it('should persist user in database with id', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const response: { body: { id: number } } = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert

            expect(response.body).toHaveProperty('id');
            expect(response.body.id).toBeDefined();
        });

        it('should assign a customer role to the user', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            await request(app).post('/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store hash password in database', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            await request(app).post('/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find({ select: ['password'] });

            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
        });

        it('should not add user if email already exists', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            // Act
            await request(app).post('/auth/register').send(userData);

            // Assert
            const user = await userRepository.find();
            expect(user).toHaveLength(1);
        });

        it('should return access and refresh token in cookie', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

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
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

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
    });

    describe('Given missing fields', () => {
        it('should return 400 status code if email is missing', async () => {
            // Arrange
            const userData = {
                email: '',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if password is missing', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if firstName is missing', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: '',
                lastName: 'Sain',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if lastName is missing', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: '',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });

    describe('Fields are not in correct format', () => {
        it('should trim the email field', async () => {
            // Arrange
            const userData = {
                email: '  test@gmail.com  ',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            await request(app).post('/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0].email).toBe(userData.email.trim());
        });

        it('should return 400 status code if email is not valid', async () => {
            // Arrange
            const userData = {
                email: 'anassain13gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if password is less than 8 characters', async () => {
            // Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '1234567',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
});
