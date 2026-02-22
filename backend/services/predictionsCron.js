const cron = require('node-cron');
const pool = require('../database');
const metalsService = require('./metals');

// Run every hour to check predictions made 24+ hours ago
cron.schedule('0 * * * *', async () => {
    try {
        const [pending] = await pool.execute(`
            SELECT id, user_id, metal, prediction, price_at_prediction 
            FROM price_predictions 
            WHERE status = 'pending' 
            AND created_at <= (NOW() - INTERVAL 24 HOUR)
        `);

        if (pending.length === 0) return;

        const currentPrices = metalsService.getLatestPrices();

        for (const p of pending) {
            const currentPrice = currentPrices[p.metal];
            if (!currentPrice) continue;

            let isCorrect = false;
            if (p.prediction === 'up' && currentPrice > p.price_at_prediction) {
                isCorrect = true;
            } else if (p.prediction === 'down' && currentPrice < p.price_at_prediction) {
                isCorrect = true;
            }

            const status = isCorrect ? 'correct' : 'wrong';

            await pool.execute(
                'UPDATE price_predictions SET status = ? WHERE id = ?',
                [status, p.id]
            );

            if (isCorrect) {
                await pool.execute(
                    'UPDATE leaderboard SET correct_predictions = correct_predictions + 1 WHERE user_id = ?',
                    [p.user_id]
                );
            }
        }
    } catch (error) {
        console.error('Error running prediction cron job:', error);
    }
});

console.log('Prediction cron service initialized.');
