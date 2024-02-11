import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';
import { Roles } from './constants';
import { User } from './entity/User';
import bcrypt from 'bcryptjs';

export const createAdminUser = async () => {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = Config;
    try {
        const userRepository = AppDataSource.getRepository(User);
        if (userRepository) {
            const isAdminPresent = await userRepository.findOne({
                where: { email: ADMIN_EMAIL },
            });

            if (isAdminPresent) {
                logger.info('Admin user already exists');
                return;
            }
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD!, saltRounds);

        return await userRepository.save({
            firstName: 'Admin',
            lastName: 'User',
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: Roles.ADMIN,
        });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};
