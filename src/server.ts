import app from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';
import { createAdminUser } from './utils';

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        await createAdminUser();
        logger.info('Database connected');
        app.listen(PORT, () => {
            logger.info(`Listening on ${PORT}`);
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

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startServer();
