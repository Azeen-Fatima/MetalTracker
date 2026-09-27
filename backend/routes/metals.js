const express = require('express');
const router = express.Router();
const metalsService = require('../services/metals');
const newsService = require('../services/news');
const exchangeService = require('../services/exchange');

router.get('/prices', (req, res) => {
    res.json(metalsService.getLatestPrices());
});

router.get('/historical', (req, res) => {
    let { metal, timeframe, offset } = req.query;
    offset = parseInt(offset) || 0;
    const currentPrices = metalsService.getLatestPrices();
    const currentPrice = currentPrices[metal] || 2000;

    let points = 30;
    let interval = 86400000;

    if (timeframe === '1d') {
        points = 30;
        interval = 86400000;
    } else if (timeframe === '4h') {
        points = 24;
        interval = 14400000;
    } else if (timeframe === '1w') {
        points = 12;
        interval = 604800000;
    }

    const data = [];
    let now = Date.now();

    if (timeframe === '4h') {
        now = Math.floor(now / 14400000) * 14400000;
    } else if (timeframe === '1d') {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        now = d.getTime();
    } else if (timeframe === '1w') {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        now = d.getTime();
    }

    const labels = [];
    const prices = [];
    const timestamps = [];

    let simPrice = currentPrice;
    const tempPrices = [];
    for (let i = 0; i < points; i++) {
        tempPrices.push(simPrice);
        const variation = simPrice * 0.015 * ((Math.random() * 2) - 1);
        simPrice -= variation;
    }
    tempPrices.reverse();

    for (let i = points - 1; i >= 0; i--) {
        const timestamp = now - (i * interval);

        const dt = new Date(timestamp);
        let label = '';
        if (timeframe === '4h') {
            label = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(dt);
        } else {
            label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(dt);
        }

        labels.push(label);
        timestamps.push(timestamp);
        prices.push(tempPrices[points - 1 - i]);
    }
    res.json({ labels, prices, timestamps });
});

router.get('/news', (req, res) => {
    res.json(newsService.getNews());
});

router.get('/exchange', (req, res) => {
    res.json({ rate: exchangeService.getExchangeRate() });
});

module.exports = router;
