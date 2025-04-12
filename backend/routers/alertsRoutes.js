const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { 
  getAlerts, 
  getRecentAlerts, 
  markAlertAsResolved, 
  clearAllAlerts 
} = require('../controllers/alertController');

// Get all alerts with filtering options
router.get('/', authenticate, getAlerts);

// Get only recent alerts (for sidebar)
router.get('/recent', authenticate, getRecentAlerts);

// Mark an alert as resolved
router.put('/:id/resolve', authenticate, markAlertAsResolved);

// Clear all alerts
router.delete('/clear', authenticate, clearAllAlerts);

module.exports = router;