import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenants';
import { ITenant } from '../types';
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
}
