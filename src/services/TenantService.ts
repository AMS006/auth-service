import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenants';
import { ITenant, TenantQueryParams } from '../types';
import createHttpError from 'http-errors';

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async create({ name, address }: ITenant) {
        const tenant = await this.tenantRepository.findOne({
            where: { name },
        });

        if (tenant) {
            const err = createHttpError(400, 'Tenant Name already exists');
            throw err;
        }

        return await this.tenantRepository.save({
            name,
            address,
        });
    }

    async getAll(queryParams: TenantQueryParams) {
        const queryClient = this.tenantRepository.createQueryBuilder('tenant');

        if (queryParams.search) {
            queryClient.where(
                'tenant.name ILIKE :search OR tenant.address ILIKE :search',
                { search: `%${queryParams.search}%` }
            );
        }

        const result = await queryClient
            .skip((queryParams.page - 1) * queryParams.limit)
            .take(queryParams.limit)
            .orderBy('tenant.id', 'DESC')
            .getManyAndCount();

        return result;
    }

    async getTenantById(id: number) {
        return await this.tenantRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, { name, address }: ITenant) {
        const tenant = await this.tenantRepository.findOne({
            where: { id },
        });
        if (!tenant) {
            const err = createHttpError(404, 'Tenant not found');
            throw err;
        }
        return await this.tenantRepository.update(id, {
            name,
            address,
        });
    }

    async delete(id: number) {
        const tenant = await this.tenantRepository.findOne({
            where: { id },
        });
        if (!tenant) {
            const err = createHttpError(404, 'Tenant not found');
            throw err;
        }
        return await this.tenantRepository.delete(id);
    }
}
