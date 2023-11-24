import express from 'express';
import { TenantController } from '../controller/TenantController';
import { TenantCreateRequest } from '../types';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenants';
import authenticate from '../middlewares/authenticate';
import canAccess from '../middlewares/canAccess';
import { Roles } from '../constants/intex';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService);

router.post('/', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    tenantController.create(req as TenantCreateRequest, res, next)
);

export default router;
