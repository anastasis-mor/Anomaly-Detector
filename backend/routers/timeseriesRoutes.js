const express = require('express');
const router = express.Router();
const { getLogsTimeSeries } = require('../controllers/timeseriesController');
const authenticate = require('../middleware/auth');

// Protect this route with authentication if needed
router.get('/', authenticate, getLogsTimeSeries);

module.exports = router;
