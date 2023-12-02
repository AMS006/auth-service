import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { Tenant } from '../../src/entity/Tenants';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';

describe('POST /tenants', () => {
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
        it('should return 201 status code when we login user with correct credentials', async () => {
            // Arrange
            const tenantData = {
                name: 'tenant1',
                address: 'tenant address',
            };

            // Act
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should persist tenant in database', async () => {
            // Arrange
            const tenantData = {
                name: 'tenant1',
                address: 'tenant address',
            };

            //Act
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            // Assert
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({
                where: {
                    id: Number((response.body as { id: string }).id),
                },
            });

            expect(tenant).toBeDefined();
            expect(tenant?.name).toBe(tenantData.name);
        });

        it('should return 400 status code if tanaent with same name already exists', async () => {
            // Arrange
            const tenantData = {
                name: 'tenant1',
                address: 'tenant address',
            };

            // Act
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const response2 = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            // Assert
            expect(response2.statusCode).toBe(400);
        });

        it('should return 401 status code if user is not authenticated', async () => {
            // Arrange
            const tenantData = {
                name: 'tenant1',
                address: 'tenant address',
            };

            // Act
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);

            // Assert
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.find();

            expect(tenant).toHaveLength(0);
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 status code if user is not admin', async () => {
            // Arrange
            const tenantData = {
                name: 'tenant1',
                address: 'tenant address',
            };

            // Act
            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(tenantData);

            // Assert
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.find();

            expect(tenant).toHaveLength(0);
            expect(response.statusCode).toBe(403);
        });
    });
});
