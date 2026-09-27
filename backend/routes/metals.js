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
<<<<<<< HEAD
        points = 30;
        interval = 86400000;
    } else if (timeframe === '4h') {
        points = 24;
        interval = 14400000;
    } else if (timeframe === '1w') {
        points = 12;
        interval = 604800000;
=======
        points = 30; // 30 days
        interval = 86400000; // 1 day in ms
    } else if (timeframe === '4h') {
        points = 24; // 24 periods of 4H
        interval = 14400000; // 4 hours in ms
    } else if (timeframe === '1w') {
        points = 12; // 12 weeks
        interval = 604800000; // 1 week in ms
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
    }

    const data = [];
    let now = Date.now();

<<<<<<< HEAD
    if (timeframe === '4h') {
        now = Math.floor(now / 14400000) * 14400000;
    } else if (timeframe === '1d') {
=======
    // Rounding to nearest period end
    if (timeframe === '4h') {
        now = Math.floor(now / 14400000) * 14400000;
    } else if (timeframe === '1d') {
        // start of day
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        now = d.getTime();
    } else if (timeframe === '1w') {
<<<<<<< HEAD
=======
        // Start of week
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        now = d.getTime();
    }

    const labels = [];
    const prices = [];
    const timestamps = [];

<<<<<<< HEAD
=======
    // Generate smooth prices going backward from current price
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
    let simPrice = currentPrice;
    const tempPrices = [];
    for (let i = 0; i < points; i++) {
        tempPrices.push(simPrice);
<<<<<<< HEAD
        const variation = simPrice * 0.015 * ((Math.random() * 2) - 1);
        simPrice -= variation;
    }
    tempPrices.reverse();
=======
        // smooth variation +/- 1.5%
        const variation = simPrice * 0.015 * ((Math.random() * 2) - 1);
        simPrice -= variation;
    }
    tempPrices.reverse(); // so tempPrices[points-1] is currentPrice
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f

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
