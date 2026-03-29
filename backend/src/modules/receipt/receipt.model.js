const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  expense_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true },
  file_url: { type: String, required: true },
  file_type: { type: String, required: true }, // 'image/jpeg', 'application/pdf', etc.
  hash: { type: String, required: true, unique: true }, // SHA256 to prevent duplicates
  ocr_status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'DONE', 'FAILED'], 
    default: 'PENDING' 
  },
  raw_text: { type: String }, // Store full OCR output
  ocr_data: {
    amount: { type: Number },
    date: { type: Date },
    merchant: { type: String },
    currency: { type: String }
  },
  confidence_score: { type: Number, min: 0, max: 1 },
  validation_status: {
    type: String,
    enum: ['PENDING', 'VALID', 'INVALID', 'NEEDS_REVIEW'],
    default: 'PENDING'
  }
}, { timestamps: true });

// Unique index is already defined on the field level.
receiptSchema.index({ expense_id: 1 });

module.exports = mongoose.model('Receipt', receiptSchema);
