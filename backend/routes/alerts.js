const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.execute(
            'SELECT * FROM price_alerts WHERE user_id = ? AND is_read = false ORDER BY id DESC LIMIT 50',
            [req.user.user_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/read', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) return res.json({ message: 'No alerts to update' });

        await req.db.query(
            'UPDATE price_alerts SET is_read = true WHERE user_id = ? AND id IN (?)',
            [req.user.user_id, ids]
        );
        res.json({ message: 'Alerts marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
