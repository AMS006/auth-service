import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}
export interface Headers {
    [key: string]: string[];
}

export interface LoginUserRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

export interface AuthRequest extends Request {
    auth: {
        id?: 'string';
        sub: string;
        role: string;
    };
}

export interface IRefreshTokenPayload {
    id: string;
    sub: string;
}

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}
export interface TenantCreateRequest extends Request {
    body: ITenant;
}

export interface UpdateUserData {
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: number;
}

export interface UpdateUserRequest extends Request {
    body: UpdateUserData;
}

export interface UserQueryParams {
    page: number;
    limit: number;
    search?: string;
    role?: string;
}

export interface TenantQueryParams {
    page: number;
    limit: number;
    search?: string;
}
