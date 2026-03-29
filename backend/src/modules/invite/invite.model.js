const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true, index: true },
  is_used: { type: Boolean, default: false },
  expires_at: { type: Date, required: true }, // Not relying natively on TTL to selectively reject expired vs active manually, but we can set TTL index
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// TTL index to automatically purge expired tokens after 24 hours
inviteSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Invite', inviteSchema);
