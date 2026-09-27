const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
<<<<<<< HEAD
        const header = req.header('Authorization');
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const token = header.replace('Bearer ', '');
=======
        const token = req.header('Authorization').replace('Bearer ', '');
>>>>>>> f188381c13324b9a002e1cc623afae2d967a027f
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};
