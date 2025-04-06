const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' } // To track which site generated the log
  // Add additional fields as needed, e.g., details: { type: Object }
});

module.exports = mongoose.model('Log', logSchema);
