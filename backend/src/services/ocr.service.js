class OCRService {
  /**
   * Mock implementation of OCR API (Google Vision / Tesseract)
   * In a real implementation, you would:
   * 1. Download image/pdf from S3/local
   * 2. Preprocess (resize, grayscale, rotate)
   * 3. Call OCR provider
   */
  async extractText(fileUrl) {
    // Simulate async network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock text for simulation purposes
    return {
      text: "MOCK_MERCHANT INC\nDate: 2023-10-15\nTotal: $120.50\nCurrency: USD\nSome random text blur.",
      rawResponse: {} 
    };
  }
}

module.exports = new OCRService();
