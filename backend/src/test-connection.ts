import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.join(__dirname, '../.env') });

const testConnection = async () => {
  console.log('🔍 Testing MongoDB Atlas connection...\n');
  
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment');
    process.exit(1);
  }
  
  // Verify it's an Atlas connection
  if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    console.log('⚠️  WARNING: Connection string contains localhost');
    console.log('   This will trigger in-memory database mode');
  } else if (mongoUri.includes('mongodb+srv://')) {
    console.log('✓ MongoDB Atlas connection string detected');
  } else if (mongoUri.includes('mongodb://')) {
    console.log('✓ MongoDB connection string detected');
  }
  
  console.log('🔗 Attempting connection...');
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`⚡ Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
    
    // Test a simple query (with null check)
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log(`📁 Collections found: ${collections.length}`);
      if (collections.length > 0) {
        console.log('   Collections:', collections.map(c => c.name).join(', '));
      }
    } else {
      console.log('⚠️ Database instance not available yet');
    }
    
    console.log('\n✅ Connection test PASSED\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection test FAILED');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

testConnection();
