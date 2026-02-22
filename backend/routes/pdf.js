const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const auth = require('../middleware/auth');
const metalsService = require('../services/metals');
const exchangeService = require('../services/exchange');
const { convertUnit, convertCurrency } = require('../utils/conversion');

router.use(auth);

router.get('/report', async (req, res) => {
    try {
        const [users] = await req.db.execute('SELECT name, currency, unit FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = users[0];

        const prices = metalsService.getLatestPrices();
        const rate = exchangeService.getExchangeRate();

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=metal_prices_report.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Metal Prices Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Generated for: ${user.name}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.text(`Currency: ${user.currency}`);
        doc.text(`Unit: ${user.unit}`);
        doc.moveDown();

        const metals = ['gold', 'silver', 'copper'];
        for (const metal of metals) {
            if (prices[metal]) {
                let price = convertUnit(prices[metal], user.unit);
                price = convertCurrency(price, user.currency, rate);
                doc.text(`${metal.charAt(0).toUpperCase() + metal.slice(1)}: ${price.toFixed(2)} ${user.currency} / ${user.unit}`);
            }
        }

        doc.end();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
