const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    phone_no: { type: String, required: true },
    password: { type: String, required: true }, // Hashed
    role: { 
        type: String, 
        enum: ['CMR', 'MANUFACTURER', 'ADMIN'], 
        default: 'CMR' 
    },
    active: { type: Boolean, default: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function() {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // No next() call needed here in an async hook!
    } catch (error) {
        throw error; // This will stop the save and return the error to the route
    }
});

module.exports = mongoose.model('User', UserSchema);