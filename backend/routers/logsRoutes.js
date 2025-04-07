const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { fetchLogs } = require('../controllers/logsController');

router.get('/', authenticate, fetchLogs);

module.exports = router;
