const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  apiKey: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey', required: true },
  // other site-specific fields
});

module.exports = mongoose.model('Site', siteSchema);