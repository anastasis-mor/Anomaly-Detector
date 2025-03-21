const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., 'login', 'logout', 'failed_login'
    ipAddress: String,
    timestamp: { type: Date, default: Date.now },
    // ...any other data you want
  });

module.exports = mongoose.model('Log', logSchema);
