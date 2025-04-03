const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { fetchLogs } = require('../controllers/logsController');

// Final path is /api/logs (not /api/logs/logs)
router.get('/', authenticate, fetchLogs);

module.exports = router;
