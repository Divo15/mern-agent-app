/**
 * Seed Script
 * Creates an initial admin user in the database
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Agent = require('./models/Agent');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create Admin
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('✅ Admin created: admin@example.com / admin123');
    } else {
      console.log('ℹ Admin already exists');
    }

    // Create sample agents
    const agentData = [
      { name: 'Alice Johnson', email: 'alice@example.com', mobile: { countryCode: '+1', number: '5551234567' }, password: 'agent123' },
      { name: 'Bob Smith',    email: 'bob@example.com',   mobile: { countryCode: '+1', number: '5559876543' }, password: 'agent123' },
      { name: 'Carol White',  email: 'carol@example.com', mobile: { countryCode: '+44', number: '7700900123' }, password: 'agent123' },
      { name: 'David Lee',    email: 'david@example.com', mobile: { countryCode: '+91', number: '9876543210' }, password: 'agent123' },
      { name: 'Emma Davis',   email: 'emma@example.com',  mobile: { countryCode: '+61', number: '412345678' },  password: 'agent123' },
    ];

    for (const agentInfo of agentData) {
      const existing = await Agent.findOne({ email: agentInfo.email });
      if (!existing) {
        await Agent.create(agentInfo);
        console.log(`✅ Agent created: ${agentInfo.name}`);
      }
    }

    console.log('\n🎉 Seed complete!');
    console.log('─────────────────────────────────');
    console.log('Admin login:');
    console.log('  Email:    admin@example.com');
    console.log('  Password: admin123');
    console.log('─────────────────────────────────');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedData();
