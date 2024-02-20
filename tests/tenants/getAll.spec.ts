import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';
import { createTestTenant } from '../utils';
import { Tenant } from '../../src/entity/Tenants';

describe('GET /tenants', () => {
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
        it('should return all tenants', async () => {
            // Act
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            await createTestTenant(connection.getRepository(Tenant));

            const response = await request(app)
                .get(`/tenants?limit=10&page=1`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body?.tenants?.length).toBeGreaterThanOrEqual(1);
            expect(response.body?.count).toBeGreaterThanOrEqual(1);
        });

        it('should return 401 status code if user is not authenticated', async () => {
            // Arrange
            const tenant = await createTestTenant(
                connection.getRepository(Tenant)
            );

            // Act
            const response = await request(app).get(`/tenants`).send();

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
                .get(`/tenants`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send();

            // Assert
            expect(response.statusCode).toBe(403);
        });
    });
});
