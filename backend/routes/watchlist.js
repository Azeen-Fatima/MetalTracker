const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.execute('SELECT * FROM watchlist WHERE user_id = ?', [req.user.user_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { metal, notify } = req.body;
        await req.db.execute(
            'INSERT INTO watchlist (user_id, metal, notify) VALUES (?, ?, ?)',
            [req.user.user_id, metal, notify !== undefined ? notify : true]
        );
        res.json({ message: 'Added to watchlist' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:metal', async (req, res) => {
    try {
        const { metal } = req.params;
        await req.db.execute('DELETE FROM watchlist WHERE user_id = ? AND metal = ?', [req.user.user_id, metal]);
        res.json({ message: 'Removed from watchlist' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
