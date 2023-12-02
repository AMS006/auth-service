import { expressjwt } from 'express-jwt';
import { IRefreshTokenPayload } from '../types';
import { Request } from 'express';
import { Config } from '../config';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import logger from '../config/logger';

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req) {
        const { refreshToken } = req.cookies as { refreshToken: string };

        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        try {
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepository.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: {
                        id: Number(
                            (token?.payload as IRefreshTokenPayload).sub
                        ),
                    },
                },
            });
            return refreshToken === null;
        } catch (error) {
            logger.error('Error which getting refresh token', {
                id: Number((token?.payload as IRefreshTokenPayload).id),
            });
            return true;
        }
    },
});
