const express = require('express');
const router = express.Router();
const { authenticateAPIKey } = require('../middleware/apiAuth');
const { ingestLog, fetchLogs, dummyAnomaly } = require('../controllers/integrationController');

router.post('/ingest-log', authenticateAPIKey,ingestLog);
router.get('/logs', authenticateAPIKey, fetchLogs);
router.post('/predict', authenticateAPIKey, dummyAnomaly);

module.exports = router;