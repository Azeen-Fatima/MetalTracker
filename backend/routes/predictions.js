const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.execute(`
      SELECT p.id, p.metal, p.prediction, p.price_at_prediction, p.status, p.created_at, u.name as user_name 
      FROM price_predictions p 
      JOIN users u ON p.user_id = u.user_id 
      ORDER BY p.created_at DESC
    `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { metal, prediction } = req.body;
        const metalsService = require('../services/metals');
        const currentPrices = metalsService.getLatestPrices();
        const currentPrice = currentPrices[metal] || 0;

        await req.db.execute(
            'INSERT INTO price_predictions (user_id, metal, prediction, price_at_prediction) VALUES (?, ?, ?, ?)',
            [req.user.user_id, metal, prediction, currentPrice]
        );

        await req.db.execute(
            'INSERT INTO leaderboard (user_id, total_predictions) VALUES (?, 1) ON DUPLICATE KEY UPDATE total_predictions = total_predictions + 1',
            [req.user.user_id]
        );

        res.json({ message: 'Prediction submitted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id/result', async (req, res) => {
    try {
        const { id } = req.params;
        const { correct } = req.body;

        const [preds] = await req.db.execute('SELECT user_id FROM price_predictions WHERE id = ?', [id]);

        if (preds.length > 0 && correct) {
            await req.db.execute(
                'UPDATE leaderboard SET correct_predictions = correct_predictions + 1 WHERE user_id = ?',
                [preds[0].user_id]
            );
        }

        res.json({ message: 'Result updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
