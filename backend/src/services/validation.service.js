class ValidationService {
  /**
   * Run hard and soft validations on an expense and its receipt
   */
  async validate(expense, receipt) {
    const flags = [];
    const violations = [];

    // HARD RULES
    if (receipt.validation_status === 'INVALID') {
      violations.push({
        type: 'OCR_FAILURE',
        field: 'receipt',
        message: 'The uploaded file could not be processed completely.'
      });
    }

    if (receipt.hash) {
      // Primary duplicate check: Exact file hash. We handled it during upload,
      // but let's reinforce it here just in case.
      const Receipt = require('../modules/receipt/receipt.model');
      const hashDups = await Receipt.countDocuments({ hash: receipt.hash, _id: { $ne: receipt._id } });
      if (hashDups > 0) {
        violations.push({
          type: 'DUPLICATE_RECEIPT',
          field: 'receipt',
          message: 'A receipt with this exact file hash already exists.'
        });
      }
    }

    if (receipt.ocr_data && receipt.ocr_data.amount && receipt.ocr_data.date && receipt.ocr_data.merchant) {
      // Fallback duplicate check: Match amount + date + merchant
      const Receipt = require('../modules/receipt/receipt.model');
      const { amount, date, merchant } = receipt.ocr_data;
      
      const ocrDups = await Receipt.countDocuments({
        _id: { $ne: receipt._id },
        'ocr_data.amount': amount,
        'ocr_data.date': date,
        'ocr_data.merchant': merchant
      });

      if (ocrDups > 0) {
        violations.push({
          type: 'DUPLICATE_RECEIPT_OCR',
          field: 'receipt',
          message: 'Another receipt with identical amount, date, and merchant already exists.'
        });
      }
    }

    // SOFT RULES
    if (receipt.confidence_score !== null && receipt.confidence_score < 0.7) {
      flags.push({
        type: 'LOW_CONFIDENCE',
        field: 'receipt',
        message: 'The system has low confidence in OCR extraction. Review manually.'
      });
    }

    if (receipt.ocr_data) {
      if (!receipt.ocr_data.merchant) {
        flags.push({
          type: 'MISSING_MERCHANT',
          field: 'merchant',
          message: 'Merchant name missing in OCR extraction.'
        });
      }
    }

    return { flags, violations };
  }
}

module.exports = new ValidationService();
