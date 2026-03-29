const currencyUtil = require('./backend/src/utils/currency.util');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

async function testConversion() {
  try {
    console.log('Testing currency conversion from EUR to USD...');
    const result = await currencyUtil.convertToBaseCurrency(100, 'EUR');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    console.log('\nTesting currency conversion from GBP to USD...');
    const result2 = await currencyUtil.convertToBaseCurrency(100, 'GBP');
    console.log('Result:', JSON.stringify(result2, null, 2));

    console.log('\nTesting currency conversion from INR to USD...');
    const result3 = await currencyUtil.convertToBaseCurrency(1000, 'INR');
    console.log('Result:', JSON.stringify(result3, null, 2));
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testConversion();
