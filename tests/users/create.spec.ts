import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

import { Tenant } from '../../src/entity/Tenants';
import { createTestTenant } from '../utils';

describe('POST /users', () => {
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
        it('should return 201 status code', async () => {
            const tenant = await createTestTenant(
                connection.getRepository(Tenant)
            );
            //Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };
            //Act

            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(201);
        });

        it('should persist user in database', async () => {
            const tenant = await createTestTenant(
                connection.getRepository(Tenant)
            );

            //Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };
            //Act

            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            expect(user).toHaveLength(1);
            expect(user[0].role).toBe(Roles.MANAGER);
            expect(user[0].email).toBe(userData.email);
        });

        it('should return 403 if non-admin user tries to create a tenant', async () => {
            const tenant = await createTestTenant(
                connection.getRepository(Tenant)
            );

            //Arrange
            const userData = {
                email: 'test@gmail.com',
                password: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };
            //Act

            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            expect(user).toHaveLength(0);
            expect(response.statusCode).toBe(403);
        });
    });
});
