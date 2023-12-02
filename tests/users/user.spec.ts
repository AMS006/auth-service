import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

describe('GET /auth/self', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        jwks.start();
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('given all fileds', () => {
        it('should return 200 status code', async () => {
            //Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            //Act
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            //Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return user data', async () => {
            //Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            //Act
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            //Assert
            expect((response.body as { id: string }).id).toBe(user.id);
        });

        it('should not return user password', async () => {
            //Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            //Act
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            //Assert
            expect(
                (response.body as { password: string }).password
            ).toBeUndefined();
        });

        it('should return 401 status code if token does not exists', async () => {
            //Arrange
            const response = await request(app).get('/auth/self').send();

            //Assert
            expect(response.statusCode).toBe(401);
        });
    });
});
