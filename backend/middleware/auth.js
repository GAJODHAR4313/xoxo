const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'xoxo_archive_secret_key_2026_secure');
        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Access Denied: Invalid or Expired Token" });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access Denied: Admin Authorization Required" });
    }
    next();
};

module.exports = { authenticateToken, requireAdmin };
