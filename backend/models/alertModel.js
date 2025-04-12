const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlertSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  siteId: {
    type: Schema.Types.ObjectId,
    ref: 'Site',
    required: true,
    index: true
  },
  sourceIP: {
    type: String
  },
  targetUser: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_positive'],
    default: 'active',
    index: true
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedLogs: [{
    type: Schema.Types.ObjectId,
    ref: 'Log'
  }]
});

// Add index for querying by multiple criteria
AlertSchema.index({ siteId: 1, type: 1, severity: 1, status: 1 });

module.exports = mongoose.model('Alert', AlertSchema);