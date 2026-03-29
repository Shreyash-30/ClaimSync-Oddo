const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  entity: { type: String, required: true }, // e.g., 'Expense', 'Receipt'
  entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'UPLOAD_RECEIPT', 'OCR_COMPLETED'
  performed_by: { type: mongoose.Schema.Types.ObjectId }, // User or System ID
  old_value: { type: mongoose.Schema.Types.Mixed },
  new_value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } }); // Append-only by nature, typically only track creation time

auditLogSchema.index({ entity: 1, entity_id: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
