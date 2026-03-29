const { Queue } = require('bullmq');
const Redis = require('ioredis');

// For local development without Redis, we mock the Queue locally
const ocrQueue = {
  add: async (name, data, opts) => {
    console.log(`[Mock Queue] Job ${name} added:`, data);
    return { id: 'mock-job-1' };
  }
};

class OCRQueueService {
  async addJob(receiptId, fileUrl) {
    if (process.env.USE_REDIS !== 'true') {
        return ocrQueue.add('process-receipt', { receiptId, fileUrl });
    }
  }
}

module.exports = new OCRQueueService();
