import { Request } from 'express';

export interface UserData {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    role?: string;
}

export interface Headers {
    [key: string]: string[];
}

export interface RegisterUserRequest extends Request {
    body: UserData;
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

export interface TenantCreateRequest extends Request {
    body: ITenant;
}
