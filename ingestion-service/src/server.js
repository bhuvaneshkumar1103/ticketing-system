require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const ticketRoutes = require('./routes/ticketRoutes');
const authRoutes = require('./routes/authRoutes');
const metaRoutes = require("./routes/metaRoutes");
const assetRoutes = require('./routes/assetRoutes');
const cors = require('cors');

const app = express();

// 1. Connect to Database
connectDB();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/users',authRoutes);
app.use("/api/config",metaRoutes)
app.use("/api/assets",assetRoutes);
// 5. Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "An unexpected error occurred on the server",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 4. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Ingestion Service running on http://localhost:${PORT}`);
});