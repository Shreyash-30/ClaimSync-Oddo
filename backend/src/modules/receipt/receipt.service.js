const fs = require('fs');
const receiptRepository = require('./receipt.repository');
const expenseRepository = require('../expense/expense.repository');
const auditService = require('../audit/audit.service');
const validationService = require('../../services/validation.service');
const queueService = require('../../queues/ocr.queue');
const { generateFileHashFromFile } = require('../../utils/hash.util');
const mongoose = require('mongoose');

class ReceiptService {
  async uploadReceipt(file, expenseId, userId) {
    try {
      // 1. Validate file exists
      if (!file) throw new Error('File not provided');

      // 2. Fetch expense to ensure it's in DRAFT status
      const expense = await expenseRepository.findById(expenseId);
      if (!expense || expense.status !== 'DRAFT') {
        throw new Error('Expense not found or not in DRAFT status');
      }

      // 3. Generate hash to detect duplicates
      const fileHash = await generateFileHashFromFile(file.path);
      const existingReceipt = await receiptRepository.findByHash(fileHash);
      if (existingReceipt) {
        throw new Error('Duplicate receipt detected in the system.');
      }

      // 4. Create receipt record
      const receiptData = {
        expense_id: expenseId,
        file_url: file.path, // In real-world, S3 url
        file_type: file.mimetype,
        hash: fileHash,
        ocr_status: 'PENDING',
        validation_status: 'PENDING'
      };

      const receipt = await receiptRepository.create(receiptData);

      // 5. Link receipt to expense
      await expenseRepository.findByIdAndUpdate(
        expenseId, 
        { 
          $push: { receipt_ids: receipt._id },
          receipt_processing_status: 'PENDING'
        }
      );

      // 6. Audit Logging
      await auditService.log(
        'Receipt',
        receipt._id,
        'UPLOAD_RECEIPT',
        userId,
        null,
        { file_url: receipt.file_url, expense_id: expenseId }
      );

      // 7. Enqueue OCR Job after successful transaction
      try {
          await queueService.addJob(receipt._id, receipt.file_url);
      } catch (qErr) {
          console.error("Failed to enqueue OCR job but receipt was uploaded:", qErr);
      }

      return receipt;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReceiptService();
