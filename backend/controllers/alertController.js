const Alert = require('../models/alertModel');
const { getSocket } = require('../socket');

// Get all alerts with filtering options
const getAlerts = async (req, res) => {
  try {
    const { 
      type, 
      severity, 
      timeRange,
      limit = 100,
      offset = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    console.log('Fetching alerts with query:', req.query);
    // Build query object
    const query = {};
    
    
    // Add type filter if provided
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Add severity filter if provided
    if (severity && severity !== 'all') {
      query.severity = severity;
    }
    
    // Add time range filter if provided
    if (timeRange && timeRange !== 'all') {
      const timeThreshold = new Date();
      
      switch(timeRange) {
        case '1h':
          timeThreshold.setHours(timeThreshold.getHours() - 1);
          break;
        case '6h':
          timeThreshold.setHours(timeThreshold.getHours() - 6);
          break;
        case '24h':
          timeThreshold.setHours(timeThreshold.getHours() - 24);
          break;
        case '7d':
          timeThreshold.setDate(timeThreshold.getDate() - 7);
          break;
      }
      
      query.timestamp = { $gte: timeThreshold };
    }
    console.log('MongoDB query:', JSON.stringify(query));

    // Execute query with pagination and sorting
    const alerts = await Alert.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Alert.countDocuments(query);
    console.log(`Found ${alerts.length} alerts matching the query`);
    res.status(200).json({
      data: alerts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent alerts for sidebar
const getRecentAlerts = async (req, res) => {
  try {
    // Get last 24 hours by default
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - 24);
    
    // Count by severity for statistics
    const counts = await Alert.aggregate([
      { $match: { timestamp: { $gte: timeThreshold } } },
      { $group: { 
        _id: '$severity', 
        count: { $sum: 1 } 
      }}
    ]);
    
    // Format the results
    const severityCounts = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };
    
    counts.forEach(item => {
      if (item._id) {
        severityCounts[item._id] = item.count;
      }
    });
    
    // Get the most recent alert
    const mostRecent = await Alert.findOne()
      .sort({ timestamp: -1 })
      .limit(1);
    
    res.status(200).json({
      counts: severityCounts,
      total: Object.values(severityCounts).reduce((a, b) => a + b, 0),
      mostRecent
    });
  } catch (error) {
    console.error('Error fetching recent alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark an alert as resolved
const markAlertAsResolved = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findByIdAndUpdate(id, 
      { 
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: req.userId
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Emit socket event to inform clients
    const io = getSocket();
    if (io) {
      io.to(alert.siteId.toString()).emit('alert_resolved', alert);
    }
    
    res.status(200).json(alert);
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear all alerts
const clearAllAlerts = async (req, res) => {
  try {
    const { siteId, type, severity } = req.query;
    
    // Build query object
    const query = {};
    
    // Add siteId filter if provided
    if (siteId) {
      query.siteId = siteId;
    }
    
    // Add type filter if provided
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Add severity filter if provided
    if (severity && severity !== 'all') {
      query.severity = severity;
    }
    
    const result = await Alert.updateMany(
      query,
      { 
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: req.userId
      }
    );
    
    // Emit socket event to inform clients
    const io = getSocket();
    if (io) {
      io.to(siteId || 'all').emit('alerts_cleared', { 
        count: result.nModified,
        filters: { type, severity, siteId }
      });
    }
    
    res.status(200).json({ 
      message: `${result.nModified} alerts cleared successfully` 
    });
  } catch (error) {
    console.error('Error clearing alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAlerts,
  getRecentAlerts,
  markAlertAsResolved,
  clearAllAlerts
};