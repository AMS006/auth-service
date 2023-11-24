import { NextFunction, Response } from 'express';
import { TenantCreateRequest } from '../types';
import { TenantService } from '../services/TenantService';

export class TenantController {
    constructor(private tenantService: TenantService) {}
    async create(req: TenantCreateRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;

        try {
            const tenant = await this.tenantService.create({ name, address });

            res.status(201).json(tenant);
        } catch (error) {
            next(error);
        }
    }
}
