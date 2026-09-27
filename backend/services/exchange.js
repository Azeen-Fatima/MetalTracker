const axios = require('axios');
const cron = require('node-cron');

let cachedRate = 278.50; // Default fallback

const fetchExchangeRate = async () => {
    try {
        const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/USD`;
        const response = await axios.get(url);
        if (response.data && response.data.conversion_rates && response.data.conversion_rates.PKR) {
            cachedRate = response.data.conversion_rates.PKR;
        }
    } catch (error) {
        console.error(error.message);
    }
};

cron.schedule('*/30 * * * *', fetchExchangeRate);
fetchExchangeRate();

module.exports = {
    getExchangeRate: () => cachedRate
};
