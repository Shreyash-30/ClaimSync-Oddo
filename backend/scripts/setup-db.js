require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

// Import all models to register their schemas and sync indexes
const AuditLog = require('../src/modules/audit/audit.model');
const Expense = require('../src/modules/expense/expense.model');
const Receipt = require('../src/modules/receipt/receipt.model');
const ExpenseVersion = require('../src/modules/version/version.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/claimsync';

async function setupDatabase() {
  try {
    console.log(`🔌 Connecting to MongoDB at ${MONGO_URI}...`);
    // Connect to the DB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected successfully!');

    console.log('⚙️  Creating explicit collections and syncing database indexes...');

    // In mongoose, calling createCollection on a model forces it to be created 
    // in the DB even if it's empty, and syncIndexes creates unique constraints natively.
    await AuditLog.createCollection();
    await AuditLog.syncIndexes();
    console.log('   - AuditLog collection & indexes created.');

    await Expense.createCollection();
    await Expense.syncIndexes();
    console.log('   - Expense collection & indexes created.');

    await Receipt.createCollection();
    await Receipt.syncIndexes();
    console.log('   - Receipt collection & indexes created.');

    await ExpenseVersion.createCollection();
    await ExpenseVersion.syncIndexes();
    console.log('   - ExpenseVersion collection & indexes created.');

    // Insert a startup log to definitively seed the database
    const startLog = new AuditLog({
        entity: 'System Boot',
        entity_id: new mongoose.Types.ObjectId(),
        action: 'DB_SETUP',
        performed_by: null,
        new_value: { message: 'Database explicitly initialized and indexes built.' }
    });
    await startLog.save();

    console.log('🚀 Database setup is fully complete! You are ready to go.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to set up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
