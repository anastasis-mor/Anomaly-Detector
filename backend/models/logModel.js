const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  action: { 
    type: String, 
    required: true 
  },
  ipAddress: { 
    type: String 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  site: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Site' 
  },
  details: { 
    type: mongoose.Schema.Types.Mixed 
  },
  userAgent: { 
    type: String 
  }
});

module.exports = mongoose.model('Log', logSchema);
