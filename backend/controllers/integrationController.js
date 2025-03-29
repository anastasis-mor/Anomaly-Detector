const Log = require('../models/logModel');

const ingestLog = async (req, res) => {

    try {
      const logData = req.body;
      // Validate required fields.
      if (!logData.action) {
        return res.status(400).json({ error: 'Action is required' });
      }
      // Set a default timestamp if none provided.
      if (!logData.timestamp) {
        logData.timestamp = new Date();
      }
      // Create the log record.
      const logRecord = await Log.create(logData);
      return res.json({ success: true, log: logRecord });
    } catch (error) {
      console.error('Error ingesting log:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  };

  const fetchLogs = async (req, res) => {
    try {
      // For now, return all logs.
      const logs = await Log.find({});
      return res.json(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  };

// (For now, it returns a dummy anomaly score. Later, after we integrate TensorFlow.js.)
const dummyAnomaly = (req, res) => {
  try {
    const { features } = req.body;
    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: 'Features must be provided as an array' });
    }
    // Dummy implementation: return a random anomaly score.
    const anomalyScore = Math.random();
    return res.json({ anomalyScore });
  } catch (error) {
    console.error('Error in prediction endpoint:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { ingestLog, fetchLogs, dummyAnomaly };
