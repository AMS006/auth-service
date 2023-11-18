import fs from 'fs';
import path from 'path';
import { JwtPayload, sign } from 'jsonwebtoken';
import { Config } from '../config';
import { UserData } from '../types';
import { RefreshToken } from '../entity/RefreshToken';
import { Repository } from 'typeorm';

export class TokenService {
    constructor(private tokenRepository: Repository<RefreshToken>) {}

    generateAccessToken(payload: JwtPayload) {
        const privateKey = fs.readFileSync(
            path.join(__dirname, '../../certs/private.pem')
        );
        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        });
        return refreshToken;
    }

    async persistRefreshToken(user: UserData) {
        const newRefreshToken = await this.tokenRepository.save({
            user,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        });
        return newRefreshToken;
    }
}
