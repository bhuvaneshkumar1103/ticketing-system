const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected Locally');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Stop the app if DB fails
    }
};

module.exports = connectDB;