const axios = require('axios');

const BASE_CURRENCY = process.env.BASE_CURRENCY || 'USD'; 

// In-memory cache for live rates to prevent API rate-limiting delays
let exchangeRatesCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 3600000; // 1 hour locally cached

/**
 * Fetch live exchange rates and cache them
 */
async function getLiveRates() {
  const now = Date.now();
  if (exchangeRatesCache && (now - lastFetchTime) < CACHE_TTL) {
    return exchangeRatesCache;
  }

  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`);
    exchangeRatesCache = response.data.rates;
    lastFetchTime = now;
    return exchangeRatesCache;
  } catch (err) {
    console.error('Failed to fetch live exchange rates:', err.message);
    if (exchangeRatesCache) return exchangeRatesCache; // Fallback to stale cache
    throw new Error('Exchange rates unavailable');
  }
}

/**
 * Convert amount to base currency
 * @param {Number} amount 
 * @param {String} fromCurrency 
 * @returns {Promise<Object>} { converted_amount, conversion_rate }
 */
exports.convertToBaseCurrency = async (amount, fromCurrency) => {
  const currency = fromCurrency.toUpperCase();
  if (currency === BASE_CURRENCY) {
    return { converted_amount: amount, conversion_rate: 1 };
  }

  const rates = await getLiveRates();
  const rate = rates[currency];
  
  if (!rate) {
    throw new Error(`Conversion rate for currency ${currency} not found on ExchangeRate-API.`);
  }

  // To convert TO base currency: amount / rate
  const conversion_rate = 1 / rate;
  return {
    converted_amount: Number((amount * conversion_rate).toFixed(2)),
    conversion_rate
  };
};

/**
 * Utility to fetch all countries and their currencies (for frontend population)
 */
exports.getCountriesAndCurrencies = async () => {
    try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
        return response.data;
    } catch (err) {
        console.error('Failed to fetch country data:', err.message);
        throw new Error('RestCountries API unavailable');
    }
};
