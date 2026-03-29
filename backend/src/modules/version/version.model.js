const mongoose = require('mongoose');

const expenseVersionSchema = new mongoose.Schema({
  expense_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true, index: true },
  version: { type: Number, required: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true }, // The full document data at that version
}, { timestamps: true });

// Unique index for expense_id + version combination
expenseVersionSchema.index({ expense_id: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('ExpenseVersion', expenseVersionSchema);
