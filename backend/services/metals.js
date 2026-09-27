const axios = require('axios');
const cron = require('node-cron');
const pool = require('../database');

let cachedPrices = {
    gold: 0,
    silver: 0,
    copper: 0,
    timestamp: null
};

let previousPrices = {
    gold: 0,
    silver: 0,
    copper: 0
};

const fetchMetals = async () => {
    try {
        const url = `https://api.metals.dev/v1/latest?api_key=${process.env.METALS_API_KEY}&currency=USD&unit=toz`;
        const response = await axios.get(url);
        const data = response.data;

        const newPrices = {
            gold: data.metals.gold || data.metals.XAU,
            silver: data.metals.silver || data.metals.XAG,
            copper: data.metals.copper || data.metals.XCU,
            timestamp: new Date()
        };

        if (previousPrices.gold > 0) {
            const metals = ['gold', 'silver', 'copper'];
            for (const metal of metals) {
                const oldPrice = previousPrices[metal];
                const newPrice = newPrices[metal];
                if (oldPrice > 0 && newPrice) {
                    const change = Math.abs((newPrice - oldPrice) / oldPrice) * 100;

                    if (change >= 5 && newPrice > oldPrice) {
                        const direction = 'up';
                        const [watchers] = await pool.execute('SELECT user_id FROM watchlist WHERE metal = ? AND notify = true', [metal]);

                        for (const watcher of watchers) {
                            await pool.execute(
                                'INSERT INTO price_alerts (user_id, metal, threshold_price, direction) VALUES (?, ?, ?, ?)',
                                [watcher.user_id, metal, newPrice, direction]
                            );
                        }
                    }
                }
            }
        }

        if (newPrices.gold) previousPrices.gold = newPrices.gold;
        if (newPrices.silver) previousPrices.silver = newPrices.silver;
        if (newPrices.copper) previousPrices.copper = newPrices.copper;

        cachedPrices = { ...cachedPrices, ...newPrices, timestamp: new Date() };
    } catch (error) {
        console.error(error.message);
    }
};

cron.schedule('0 * * * *', fetchMetals);
fetchMetals();

module.exports = {
    getLatestPrices: () => cachedPrices
};
