import express from 'express';
import { TenantController } from '../controller/TenantController';
import { TenantCreateRequest } from '../types';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenants';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService);

router.post('/', (req, res, next) =>
    tenantController.create(req as TenantCreateRequest, res, next)
);

export default router;
