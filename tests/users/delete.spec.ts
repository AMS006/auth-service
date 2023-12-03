import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

import { Tenant } from '../../src/entity/Tenants';
import { createTestTenant, createTestUser } from '../utils';

describe('DELETE /users/:id', () => {
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
            const tenant = await createTestTenant(
                connection.getRepository(Tenant)
            );

            const user = await createTestUser(
                connection.getRepository(User),
                tenant.id
            );

            //Act

            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .delete(`/users/${user.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send();

            //Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return 403 if non-admin user tries to update user', async () => {
            const tenant = await createTestTenant(
                connection.getRepository(Tenant)
            );

            const user = await createTestUser(
                connection.getRepository(User),
                tenant.id
            );

            //Act

            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .delete(`/users/${user.id}`)
                .set('Cookie', [`accessToken=${managerToken}`])
                .send();

            //Assert
            expect(response.statusCode).toBe(403);
        });
    });
});
