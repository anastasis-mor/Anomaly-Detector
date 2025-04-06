const express = require('express');
const router = express.Router();
const Log = require('./logModel');

router.post('/ingest-log', async (req, res) => {
  try {
    // If the request body contains a 'logs' property, handle as a batch:
    if (req.body.logs && Array.isArray(req.body.logs)) {
      const logRecords = await Log.insertMany(req.body.logs);
      res.json({ success: true, logs: logRecords });
    } else {
      // Otherwise, treat it as a single log event
      const logData = req.body;
      const logRecord = await Log.create(logData);
      res.json({ success: true, log: logRecord });
    }
  } catch (error) {
    console.error('Error ingesting log:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
