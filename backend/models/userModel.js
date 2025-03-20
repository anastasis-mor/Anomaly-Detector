const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email is unique
    },
    password: {
        type: String,
        required: true,
    },
    role: { 
        type: String, 
        default: "user", 
        enum: ["user", "admin"] 
    },
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' }
}, { timestamps: true });

// Export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;