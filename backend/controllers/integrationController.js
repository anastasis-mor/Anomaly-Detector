const Log = require('../models/logModel');
const ApiKey = require('../models/apiKey');
const Site = require('../models/siteModel');
const { runAllChecks } = require('./anomalyDetection');

const ingestLog = async (req, res) => {
  try {
    // Extract the API key from headers (already validated by middleware)
    const clientApiKey = req.header('x-api-key');
    
    // Look up the ApiKey document (could cache this from middleware)
    const validKey = await ApiKey.findOne({ apiKey: clientApiKey });
    const siteDoc = await Site.findOne({ apiKey: validKey._id });
    
    let siteId = siteDoc._id;
    
    // Handle batch logs
    if (req.body.logs && Array.isArray(req.body.logs)) {
      const processedLogs = req.body.logs.map(log => {
        // Set timestamp if needed
        if (!log.timestamp) {
          log.timestamp = new Date();
        }
        // Add site information
        log.site = siteId;
        if (!log.ipAddress) {
          log.ipAddress = req.ip;
        }
        return log;
      });
      
      // Filter logs without action
      const validLogs = processedLogs.filter(log => log.action);
      
      if (validLogs.length === 0) {
        return res.status(400).json({ error: 'At least one log must have an action' });
      }
      
      // Create log records
      const logRecords = await Log.insertMany(validLogs);
      
      // Run anomaly detection checks after receiving logs
      await runAllChecks(siteId.toString());
      
      return res.json({ success: true, logs: logRecords });
    } else {
      // Handle single log
      const logData = req.body;
      
      if (!logData.action) {
        return res.status(400).json({ error: 'Action is required' });
      }
      
      if (!logData.timestamp) {
        logData.timestamp = new Date();
      }
      
      logData.site = siteId;

      if (!logData.ipAddress) {
        logData.ipAddress = req.ip;
      }
      
      const logRecord = await Log.create(logData);
      
      // Run anomaly detection checks after receiving a log
      await runAllChecks(siteId.toString());
      
      return res.json({ success: true, log: logRecord });
    }
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
