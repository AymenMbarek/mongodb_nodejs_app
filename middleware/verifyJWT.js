// verifyJWT.js

const jwt = require('jsonwebtoken');

// Fonction middleware pour vérifier le jeton JWT
function verifyJWT(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key_here');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
}

module.exports = verifyJWT;