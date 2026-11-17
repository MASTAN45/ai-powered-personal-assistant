import { logger } from './logger';
interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

class EnvironmentValidator {
  private requiredVariables = ['MONGODB_URI', 'JWT_SECRET', 'PORT', 'FRONTEND_URL'];

  validate(): EnvironmentConfig {
    logger.info('Validating environment variables...');
    
    const missing: string[] = [];
    for (const varName of this.requiredVariables) {
      if (!process.env[varName]) missing.push(varName);
    }

    if (missing.length > 0) {
      logger.error('FATAL ERROR: Missing required environment variables:');
      missing.forEach(v => logger.error(`  - ${v}`));
      logger.error('Please check your .env file');
      process.exit(1);
    }

    const jwtSecret = process.env.JWT_SECRET!;
    if (jwtSecret.length < 32) {
      logger.error(`FATAL ERROR: JWT_SECRET must be at least 32 characters (current: ${jwtSecret.length})`);
      process.exit(1);
    }

    const port = parseInt(process.env.PORT!);
    if (isNaN(port) || port < 1024 || port > 65535) {
      logger.error(`FATAL ERROR: PORT must be between 1024-65535 (current: ${process.env.PORT})`);
      process.exit(1);
    }

    const mongoUri = process.env.MONGODB_URI!;
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      logger.error('FATAL ERROR: MONGODB_URI must be a valid MongoDB connection string');
      process.exit(1);
    }

    const frontendUrl = process.env.FRONTEND_URL!;
    try {
      new URL(frontendUrl);
    } catch {
      logger.error(`FATAL ERROR: FRONTEND_URL must be a valid URL (current: ${frontendUrl})`);
      process.exit(1);
    }

    logger.info('Environment validation successful');
    logger.info(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`PORT: ${port}`);
    logger.info(`JWT_SECRET: ******* (${jwtSecret.length} chars)`);
    logger.info(`FRONTEND_URL: ${frontendUrl}`);

    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: port,
      MONGODB_URI: mongoUri,
      JWT_SECRET: jwtSecret,
      FRONTEND_URL: frontendUrl,
    };
  }
}

export const environmentValidator = new EnvironmentValidator();
export type { EnvironmentConfig };