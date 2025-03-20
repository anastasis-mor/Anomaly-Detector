const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
  action: String,
  timestamp: Date,
  riskScore: Number,
  // ...
});

module.exports = mongoose.model('Log', logSchema);
