const Receipt = require('./receipt.model');

class ReceiptRepository {
  async create(data, session = null) {
    const receipt = new Receipt(data);
    return receipt.save({ session });
  }

  async findById(id) {
    return Receipt.findById(id).lean();
  }

  async findByHash(hash) {
    return Receipt.findOne({ hash }).lean();
  }

  async updateById(id, updateData) {
    return Receipt.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async updateOcrData(id, ocrStatus, ocrData, confidenceScore, validationStatus, rawText = null) {
    const update = {
        ocr_status: ocrStatus,
        validation_status: validationStatus
    };
    if (ocrData !== null) update.ocr_data = ocrData;
    if (confidenceScore !== null) update.confidence_score = confidenceScore;
    if (rawText !== null) update.raw_text = rawText;

    return Receipt.findByIdAndUpdate(id, update, { new: true }).lean();
  }
}

module.exports = new ReceiptRepository();
