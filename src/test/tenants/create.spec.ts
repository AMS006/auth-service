import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import app from '../../app';
import { Tenant } from '../../entity/Tenants';

describe('POST /tenants', () => {
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
        it('should return 201 status code when we login user with correct credentials', async () => {
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
            expect(response.statusCode).toBe(201);
        });

        it('should persist tenant in database', async () => {
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
            await request(app).post('/tenants').send(tenantData);

            const response2 = await request(app)
                .post('/tenants')
                .send(tenantData);

            // Assert
            expect(response2.statusCode).toBe(400);
        });
    });
});
