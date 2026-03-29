require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const ocrWorker = require('./workers/ocr.worker');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/claimsync';

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI}`);

    // Create indexes if necessary automatically (in prod usually handled by migrations)
    // mongoose.set('autoIndex', true); 
    
    // 2. Start Express app
    app.listen(PORT, () => {
      console.log(`🚀 Server starting on port ${PORT}...`);
    });
    
    // 3. Worker logic runs automatically via the import in ocr.worker.js
    console.log(`⚙️  OCR Worker initialized`);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down server...');
      await mongoose.disconnect();
      await ocrWorker.close();
      process.exit(0);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
