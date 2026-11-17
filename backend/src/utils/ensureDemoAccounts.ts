import { User } from '../models/User.model';
import { logger } from '../config/logger';
import { Pairing } from '../models/Pairing.model';
import { authService } from '../services/auth.service';
import { v4 as uuidv4 } from 'uuid';

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const ensureDemoAccounts = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') return;

  const maxRetries = 3;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info('Checking demo accounts...');

      let assistant, client;

      const assistantExists = await User.findOne({ email: 'demo-assistant@example.com' });
      if (!assistantExists) {
        const result = await authService.register({
          email: 'demo-assistant@example.com',
          password: 'password123',
          fullName: 'Sarah Chen (Demo Assistant)',
          role: 'ASSISTANT',
        });
        assistant = result.user;
        logger.info('Created demo assistant account');
      } else {
        assistant = assistantExists;
        logger.info('Demo assistant account exists');
      }

      const clientExists = await User.findOne({ email: 'demo-client@example.com' });
      if (!clientExists) {
        const result = await authService.register({
          email: 'demo-client@example.com',
          password: 'password123',
          fullName: 'David Thompson (Demo Client)',
          role: 'CLIENT',
        });
        client = result.user;
        logger.info('Created demo client account');
      } else {
        client = clientExists;
        logger.info('Demo client account exists');
      }

      const existingPairing = await Pairing.findOne({
        assistant: assistant._id,
        client: client._id,
      });

      if (!existingPairing) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);

        await Pairing.create({
          assistant: assistant._id,
          client: client._id,
          status: 'ACCEPTED',
          invitationCode: uuidv4(),
          invitedAt: new Date(),
          acceptedAt: new Date(),
          expiresAt,
        });
        logger.info('Created pairing between demo accounts');
      } else {
        logger.info('Demo account pairing exists');
      }

      logger.info('Demo Credentials:');
      logger.info('  Assistant: demo-assistant@example.com / password123');
      logger.info('  Client: demo-client@example.com / password123');

      return;

    } catch (error) {
      logger.error(`Error ensuring demo accounts (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        logger.info(`Retrying in ${retryDelay / 1000}s...`);
        await sleep(retryDelay);
      } else {
        logger.warn('Warning: Failed to ensure demo accounts after all retries');
        logger.warn('Server will continue but demo login may not work');
      }
    }
  }
};