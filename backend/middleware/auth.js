const { verifyToken } = require('../utils/jwtHelper');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
