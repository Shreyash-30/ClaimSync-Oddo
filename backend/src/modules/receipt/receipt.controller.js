const receiptService = require('./receipt.service');

class ReceiptController {
  async uploadReceipt(req, res, next) {
    try {
      // Multer file object is in req.file
      const file = req.file;
      const { expense_id, user_id } = req.body; // In real app, user_id from token

      if (!expense_id) {
         return res.status(400).json({ success: false, message: 'Expense ID is required' });
      }

      if (!file) {
         return res.status(400).json({ success: false, message: 'File is required' });
      }

      const receipt = await receiptService.uploadReceipt(file, expense_id, user_id);

      return res.status(201).json({
        success: true,
        message: 'Receipt uploaded and queued for processing',
        data: receipt
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReceiptController();
