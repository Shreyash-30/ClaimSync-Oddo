const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/modules/user/user.model');

async function listUsers() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/claimsync';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const users = await User.find({}, 'name email role company_id').lean();
    console.log('--- Current Users in Database ---');
    users.forEach(u => {
      console.log(`- ${u.name || (u.email.split('@')[0])} (${u.email}) [Role: ${u.role}]`);
    });
    
    console.log('\n🔒 SECURITY NOTE: Passwords are encrypted as hashes in MongoDB.');
    console.log('🔓 SEEDED PASSWORD: EnterprisePassword123!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to list users:', error);
    process.exit(1);
  }
}

listUsers();
