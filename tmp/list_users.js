const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/backend/.env' });
const User = require('./backend/src/modules/user/user.model');

async function listUsers() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/claimsync';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const users = await User.find({}, 'name email role company_id').lean();
    console.log('--- Current Users ---');
    users.forEach(u => {
      console.log(`- ${u.name || '[No Name]'} (${u.email}) [Role: ${u.role}] (ID: ${u._id})`);
    });
    
    console.log('\nNote: Passwords are encrypted (hashed). For seeded users, the password is: EnterprisePassword123!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to list users:', error);
    process.exit(1);
  }
}

listUsers();
