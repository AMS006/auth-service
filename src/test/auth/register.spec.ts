import app from '../../app';
import request from 'supertest';
import { User } from '../../entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { Roles } from '../../constants/intex';

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
                email: 'anassain13@gmail.com',
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
                email: 'anassain13@gmail.com',
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
                email: 'anassain13@gmail.com',
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
                email: 'anassain13@gmail.com',
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
                email: 'anassain13@gmail.com',
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
                email: 'anassain13@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            // Act
            await request(app).post('/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it('should return 400 status code if email already exists', async () => {
            // Arrange
            const userData = {
                email: 'anassain13@gmail.com',
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
    });
});
