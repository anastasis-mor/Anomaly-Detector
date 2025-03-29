const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., 'login', 'logout', 'failed_login'
    ipAddress: String,
    timestamp: { type: Date, default: Date.now },
    site: { type: mongoose.Schema.Types.ObjectId, ref: "Site" } //after the project is completed we have to do it required true
  });

module.exports = mongoose.model('Log', logSchema);
