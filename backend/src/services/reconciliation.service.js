const expenseRepository = require('../modules/expense/expense.repository');
const receiptRepository = require('../modules/receipt/receipt.repository');
const validationService = require('./validation.service');
const auditService = require('../modules/audit/audit.service');

class ReconciliationService {
  /**
   * Compare OCR data against Expense data
   * and update expense flags/violations based on comparison.
   */
  async reconcile(expenseId, receiptId) {
    const expense = await expenseRepository.findById(expenseId);
    const receipt = await receiptRepository.findById(receiptId);
    
    if (!expense || !receipt) {
        throw new Error('Expense or receipt not found during reconciliation');
    }

    const { flags, violations } = await validationService.validate(expense, receipt);
    
    await auditService.log(
       'Receipt',
       receiptId,
       'RECEIPT_VALIDATED',
       null, // system
       null,
       { validation_status: receipt.validation_status, new_flags: flags.length }
    );
    
    // Mismatch detection
    if (receipt.ocr_data) {
      // Check amount
      if (receipt.ocr_data.amount && Math.abs(receipt.ocr_data.amount - expense.amount) > 0.1) {
        flags.push({
          type: 'MISMATCH',
          field: 'amount',
          message: `Entered amount (${expense.amount}) differs from receipt (${receipt.ocr_data.amount})`
        });
      }

      // Currency check
      if (receipt.ocr_data.currency && receipt.ocr_data.currency !== expense.currency) {
         flags.push({
           type: 'CURRENCY_MISMATCH',
           field: 'currency',
           message: `Entered currency (${expense.currency}) differs from receipt (${receipt.ocr_data.currency})`
         });
      }

      // Date mismatch (naive check, date vs yyyy-mm-dd string)
      if (receipt.ocr_data.date && expense.date) {
         const rDateStr = receipt.ocr_data.date.toISOString().split('T')[0];
         const eDateStr = expense.date.toISOString().split('T')[0];
         if (rDateStr !== eDateStr) {
           flags.push({
             type: 'MISMATCH',
             field: 'date',
             message: `Entered date (${eDateStr}) differs from receipt (${rDateStr})`
           });
         }
      }
    }

    // Final Snapshot Implementation
    const finalized_data = {
      amount: receipt.ocr_data?.amount || expense.amount,
      date: receipt.ocr_data?.date || expense.date,
      merchant: receipt.ocr_data?.merchant || expense.merchant || 'UNKNOWN',
      currency: receipt.ocr_data?.currency || expense.currency
    };

    // Merge existing flags and violations with new ones
    // Real implementation should deduplicate and manage flags appropriately
    const updatedExpense = await expenseRepository.findByIdAndUpdate(expenseId, {
       flags,
       violations,
       confidence_score: receipt.confidence_score,
       finalized_data
    });

    await auditService.log(
       'Expense',
       expenseId,
       'EXPENSE_FINALIZED',
       null, // system
       null,
       { finalized_data }
    );

    return updatedExpense;
  }
}

module.exports = new ReconciliationService();
