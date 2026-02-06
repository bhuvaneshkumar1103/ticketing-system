const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. REGISTER USER
router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, message: "User created successfully" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 2. LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !user.active) {
            return res.status(401).json({ success: false, message: "Invalid credentials or inactive user" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role, city: user.city, state: user.state },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token,
            user: {
                name: user.name,
                role: user.role,
                city: user.city
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const { authorize } = require('../middleware/auth');

// GET /api/users/me
// Returns the decoded token data (role, city, state)
router.get('/me', authorize(['CMR', 'MANUFACTURER', 'ADMIN']), async (req, res) => {
    // req.user was populated by the authorize middleware
    const user = await User.findOne({ 
                _id: req.user.id, 
            });
    res.json({
        success: true,
        user: user 
    });
});
module.exports = router;