import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';
import { createTestTenant } from '../utils';
import { Tenant } from '../../src/entity/Tenants';

describe('DELETE /tenants/:id', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('given body fileds are valid', () => {
        it('should return 200 status code', async () => {
            // Arrange
            const tenant = await createTestTenant(
                connection.getRepository(Tenant)
            );

            // Act
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .delete(`/tenants/${tenant.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return 401 status code if user is not authenticated', async () => {
            // Arrange
            const tenant = await createTestTenant(
                connection.getRepository(Tenant)
            );

            // Act
            const response = await request(app)
                .delete(`/tenants/${tenant.id}`)
                .send();

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 status code if user is not admin', async () => {
            // Arrange
            const tenant = await createTestTenant(
                connection.getRepository(Tenant)
            );

            // Act
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .delete(`/tenants/${tenant.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send();

            // Assert
            expect(response.statusCode).toBe(403);
        });
    });
});
