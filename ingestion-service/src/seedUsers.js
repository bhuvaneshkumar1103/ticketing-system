const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const users = [
    {
        name: "Admin User", username: "admin", email: "admin@system.com",
        password: "password123", role: "ADMIN", phone_no: "123",
        city: "Mumbai", state: "Maharashtra", active: true
    },
    {
        name: "CMR North", username: "cmr_north", email: "cmr@system.com",
        password: "password123", role: "CMR", phone_no: "456",
        city: "Delhi", state: "Delhi", active: true
    },
    {
        name: "Device Factory", username: "factory_01", email: "mfg@system.com",
        password: "password123", role: "MANUFACTURER", phone_no: "789",
        city: "Bangalore", state: "Karnataka", active: true
    }
];

const seedUsers = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    for (let u of users) {
        const user = new User(u);
        await user.save(); // This will trigger the password hashing hook
    }
    console.log("✅ Users Seeded: admin, cmr_north, factory_01 (Pass: password123)");
    process.exit();
};

seedUsers();