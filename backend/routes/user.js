const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'metaltracker',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.use(auth);

router.get('/profile', async (req, res) => {
    try {
        const [users] = await req.db.execute('SELECT user_id, name, email, profile_pic, theme, currency, unit, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/update', async (req, res) => {
    try {
        const { name, theme, currency, unit } = req.body;
        await req.db.execute(
            'UPDATE users SET name = ?, theme = ?, currency = ?, unit = ? WHERE id = ?',
            [name, theme, currency, unit, req.user.id]
        );
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/change-password', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }
        if (!/\d/.test(newPassword)) {
            return res.status(400).json({ message: 'New password must contain at least one digit' });
        }

        const [rows] = await req.db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await req.db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/send-email-change', async (req, res) => {
    try {
        const { newEmail } = req.body;
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000);

        await req.db.execute(
            'INSERT INTO verification_codes (email, code, type, expires_at) VALUES (?, ?, ?, ?)',
            [newEmail, code, 'email_change', expiresAt]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: newEmail,
            subject: 'Email Change Verification Code',
            text: `Your verification code is ${code}`
        });

        res.json({ message: 'Verification code sent' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/confirm-email-change', async (req, res) => {
    try {
        const { newEmail, code } = req.body;
        const [rows] = await req.db.execute(
            'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND type = "email_change" AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [newEmail, code]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        await req.db.execute('UPDATE users SET email = ? WHERE id = ?', [newEmail, req.user.id]);
        res.json({ message: 'Email updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/upload-pic', upload.single('profile_pic'), async (req, res) => {
    console.log('Upload route hit');
    console.log('File:', req.file);
    console.log('User:', req.user);
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const imageUrl = req.file.path;
        await req.db.execute('UPDATE users SET profile_pic = ? WHERE id = ?', [imageUrl, req.user.id]);
        res.json({ message: 'Profile updated', profile_pic: imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
