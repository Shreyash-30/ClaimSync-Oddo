class ParsingService {
  /**
   * Parse amounts, dates, and merchants from raw OCR text
   */
  async parseExtractedText(rawText) {
    const lines = rawText.split('\n');
    let amount = null;
    let date = null;
    let merchant = null;
    let currency = 'USD'; // default
    
    let fieldsFound = 0;
    const totalFields = 4;

    // VERY naive parsing for mock purposes
    const amountMatch = rawText.match(/(?:Total|Amount).*?([\d,]+\.\d{2})/i);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(',', ''));
      fieldsFound++;
    }

    const dateMatch = rawText.match(/(?:Date).*?(\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) {
      date = new Date(dateMatch[1]);
      fieldsFound++;
    }

    const currencyMatch = rawText.match(/(?:Currency).*?([A-Z]{3})/i);
    if (currencyMatch) {
      currency = currencyMatch[1];
      fieldsFound++;
    }

    // Assume merchant is on the very first non-empty line
    const nonEmptylines = lines.filter(l => l.trim().length > 0);
    if (nonEmptylines.length > 0) {
      merchant = nonEmptylines[0];
      fieldsFound++;
    }

    const confidenceScore = fieldsFound / totalFields;

    return {
      data: { amount, date, merchant, currency },
      confidenceScore 
    };
  }
}

module.exports = new ParsingService();
