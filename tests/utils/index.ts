import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../../src/entity/Tenants';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJWT = (token: string | null): boolean => {
    if (token === null) return false;
    const parts = token.split('.');

    if (parts.length !== 3) return false;

    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8');
        });
    } catch (error) {
        return false;
    }
    return true;
};

export const createTestTenant = async (repository: Repository<Tenant>) => {
    const tenant = await repository.save({
        name: 'test tenant',
        address: 'test address',
    });

    return tenant;
};

export const createTestUser = async (
    repository: Repository<User>,
    tenantId: number
) => {
    const user = await repository.save({
        email: 'test@gmail.com',
        role: Roles.MANAGER,
        firstName: 'Test',
        lastName: '1',
        tenant: { id: tenantId },
        password: '12345678',
    });
    return user;
};
