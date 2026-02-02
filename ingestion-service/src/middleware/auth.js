const ROLES = {
    CMR: 'CMR',
    MANUFACTURER: 'MANUFACTURER',
    ADMIN: 'ADMIN'
};

const jwt = require('jsonwebtoken');

const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "No token provided" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
            req.user = decoded;

            // 1. Role Check: Is the user's role in the allowed list for this route?
            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    error: `Access Denied: ${req.user.role} role does not have permission.` 
                });
            }

            // 2. Data Scoping Filter
            req.accessFilter = {};
            if (req.user.role === 'MANUFACTURER') {
                req.accessFilter.status = 'MANUFACTURER_ANALYSIS';
            }
            // For CMR, you can filter by city if you want strict regional control:
            // else if (req.user.role === 'CMR') { req.accessFilter.city = req.user.city; }

            next();
        } catch (err) {
            res.status(401).json({ error: "Invalid Token" });
        }
    };
};

module.exports = { authorize };