const mongoose = require('mongoose');

const idempotencySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  request_hash: { type: String, required: true },
  response: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now, expires: '24h' } // auto-cleanup after 24h
});

module.exports = mongoose.model('Idempotency', idempotencySchema);
