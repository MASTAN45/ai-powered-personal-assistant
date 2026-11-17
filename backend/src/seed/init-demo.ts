import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../models/User.model';
import { Pairing } from '../models/Pairing.model';
import { authService } from '../services/auth.service';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const initDemoAccounts = async () => {
  try {
    console.log('🔧 Initializing demo accounts...');
    await connectDatabase();
    
    // Check if demo accounts already exist
    const existingAssistant = await User.findOne({ email: 'demo-assistant@example.com' });
    const existingClient = await User.findOne({ email: 'demo-client@example.com' });
    
    let assistant, client;
    
    if (!existingAssistant) {
      console.log('Creating demo assistant account...');
      const assistantResult = await authService.register({
        email: 'demo-assistant@example.com',
        password: 'password123',
        fullName: 'Sarah Chen',
        role: 'ASSISTANT',
      });
      assistant = assistantResult.user;
      console.log('✅ Demo assistant created');
    } else {
      assistant = existingAssistant;
      console.log('✓ Demo assistant already exists');
    }
    
    if (!existingClient) {
      console.log('Creating demo client account...');
      const clientResult = await authService.register({
        email: 'demo-client@example.com',
        password: 'password123',
        fullName: 'David Thompson',
        role: 'CLIENT',
      });
      client = clientResult.user;
      console.log('✅ Demo client created');
    } else {
      client = existingClient;
      console.log('✓ Demo client already exists');
    }
    
    // Check if pairing exists
    const existingPairing = await Pairing.findOne({
      assistant: assistant._id,
      client: client._id,
    });
    
    if (!existingPairing) {
      console.log('Creating demo pairing...');
      await Pairing.create({
        assistant: assistant._id,
        client: client._id,
        status: 'ACCEPTED',
        invitationCode: 'INV-DEMO-1234',
        invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      console.log('✅ Demo pairing created');
    } else {
      console.log('✓ Demo pairing already exists');
    }
    
    console.log('\n✅ Demo accounts initialized!');
    console.log('\n🔐 Demo Credentials:');
    console.log('   Assistant: demo-assistant@example.com / password123');
    console.log('   Client: demo-client@example.com / password123');
    console.log('');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

initDemoAccounts();
