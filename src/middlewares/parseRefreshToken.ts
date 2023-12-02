import { expressjwt } from 'express-jwt';
import { Config } from '../config';

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req) {
        const { refreshToken } = req.cookies as { refreshToken: string };

        return refreshToken;
    },
});
