const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

<<<<<<< HEAD
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

router.post('/send-verification', async (req, res) => {
    const { email, type } = req.body;
    try {
        if (!email || !EMAIL_RE.test(email)) {
            return res.status(400).json({ error: 'A valid email is required' });
        }
        const codeType = type === 'email_change' ? 'email_change' : 'signup';

        const code = Math.floor(1000 + Math.random() * 9000).toString();

        await req.db.execute(
            'DELETE FROM verification_codes WHERE email = ? AND type = ?',
            [email, codeType]
        );

        await req.db.execute(
            'INSERT INTO verification_codes (email, code, type, expires_at) VALUES (?, ?, ?, ?)',
            [email, code, codeType, new Date(Date.now() + 10 * 60 * 1000)]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Your MetalTracker verification code',
            text: `Your verification code is ${code}. It expires in 10 minutes.`
        });

        res.json({ message: 'Code sent' });
    } catch (error) {
        console.error('Send verification error:', error.message);
        res.status(500).json({ error: 'Server error' });
=======
router.post('/send-verification', async (req, res) => {
    const { email } = req.body;
    try {
        await req.db.execute(
            'INSERT INTO verification_codes (email, code, type, expires_at) VALUES (?, ?, ?, ?)',
            [email, '1234', 'signup', new Date(Date.now() + 10 * 60 * 1000)]
        );
        res.json({ message: 'Code sent' });
    } catch (error) {
        console.error('Send verification error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: error.message });
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
    }
});

router.post('/verify-code', async (req, res) => {
    try {
        const { email, code, type } = req.body;
<<<<<<< HEAD
        if (!email || !code || !type) {
            return res.status(400).json({ error: 'Email, code and type are required' });
        }

=======
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
        const [rows] = await req.db.execute(
            'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND type = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, code, type]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

<<<<<<< HEAD
        await req.db.execute('UPDATE verification_codes SET verified = TRUE WHERE id = ?', [rows[0].id]);

=======
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
        res.json({ message: 'Code verified' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

<<<<<<< HEAD
        if (!name || !email || !EMAIL_RE.test(email) || !password || password.length < 8 || !/\d/.test(password)) {
            return res.status(400).json({ error: 'Please provide a valid name, email and an 8+ character password with a number' });
        }

        const [verified] = await req.db.execute(
            "SELECT id FROM verification_codes WHERE email = ? AND type = 'signup' AND verified = TRUE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
            [email]
        );
        if (verified.length === 0) {
            return res.status(400).json({ error: 'Please verify your email before signing up' });
=======
        if (!name || password.length < 8 || !/\d/.test(password)) {
            return res.status(400).json({ error: 'Invalid input' });
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
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

<<<<<<< HEAD
        await req.db.execute('DELETE FROM verification_codes WHERE id = ?', [verified[0].id]);

=======
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
        const token = jwt.sign({ id: result.insertId, user_id: userId }, process.env.JWT_SECRET, { expiresIn: '5d' });

        res.json({ token });
    } catch (error) {
<<<<<<< HEAD
        console.error('Signup error:', error.message);
=======
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
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
