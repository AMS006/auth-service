import app from '../../app';
import request from 'supertest';
import { User } from '../../entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { truncateTables } from '../utils';

describe('POST auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await truncateTables(connection);
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
    });
});
