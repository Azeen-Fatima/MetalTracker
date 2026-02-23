const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/send-verification', async (req, res) => {
    try {
        const { email, type } = req.body;
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000);

        await req.db.execute(
            'INSERT INTO verification_codes (email, code, type, expires_at) VALUES (?, ?, ?, ?)',
            [email, code, type, expiresAt]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verification Code',
            text: `Your verification code is ${code}`
        });

        res.json({ message: 'Verification code sent' });
    } catch (error) {
        console.error('Send verification error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/verify-code', async (req, res) => {
    try {
        const { email, code, type } = req.body;
        const [rows] = await req.db.execute(
            'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND type = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, code, type]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        res.json({ message: 'Code verified' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || password.length < 8 || !/\d/.test(password)) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const [existingUsers] = await req.db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = Math.floor(100000 + Math.random() * 900000).toString();

        const [result] = await req.db.execute(
            'INSERT INTO users (user_id, name, email, password_hash) VALUES (?, ?, ?, ?)',
            [userId, name, email, passwordHash]
        );

        const token = jwt.sign({ id: result.insertId, user_id: userId }, process.env.JWT_SECRET, { expiresIn: '5d' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await req.db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '5d' });

        delete user.password_hash;
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
