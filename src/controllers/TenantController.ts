import { NextFunction, Request, Response } from 'express';
import { TenantCreateRequest } from '../types';
import { TenantService } from '../services/TenantService';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Logger } from 'winston';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger
    ) {}
    async create(req: TenantCreateRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { name, address } = req.body;

        try {
            this.logger.info('Create new tenant request', { name });
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info('Tenant created successfully', { name });
            res.status(201).json(tenant);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getAll();
            res.status(200).json(tenants);
        } catch (error) {
            next(error);
        }
    }

    async getTenantById(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const _id = Number(id);
        if (isNaN(_id)) {
            const err = createHttpError(400, 'Invalid Tenant Id');
            return next(err);
        }
        try {
            const tenant = await this.tenantService.getTenantById(Number(id));
            if (!tenant) {
                const err = createHttpError(404, 'Tenant not found');
                return next(err);
            }
            res.status(200).json(tenant);
        } catch (error) {
            next(error);
        }
    }

    async update(req: TenantCreateRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        this.logger.info('Update tenant request', { id: req.params.id });
        const { id } = req.params;
        const { name, address } = req.body;

        if (isNaN(Number(id))) {
            const err = createHttpError(400, 'Invalid Tenant Id');
            return next(err);
        }

        try {
            const tenant = await this.tenantService.update(Number(id), {
                name,
                address,
            });
            if (!tenant) {
                const err = createHttpError(404, 'Tenant not found');
                return next(err);
            }
            this.logger.info('Tenant updated successfully', { id });
            res.status(200).json({ tenant, message: 'Tenant Updated' });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        if (isNaN(Number(id))) {
            const error = createHttpError(400, 'Invalid Tenant Id');
            return next(error);
        }
        this.logger.info('Delete tenant request', { id });
        try {
            const tenant = await this.tenantService.delete(Number(id));
            if (!tenant) {
                const error = createHttpError(404, 'Tenant not found');
                return next(error);
            }
            this.logger.info('Tenant deleted successfully', { id });
            return res.status(200).json({
                message: 'Tenant deleted successfully',
                id,
            });
        } catch (error) {
            next(error);
        }
    }
}
