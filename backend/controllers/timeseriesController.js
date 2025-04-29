const Log = require('../models/logModel');
const User = require('../models/userModel');

const getLogsTimeSeries = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('site');
    if (!user || !user.site) {
      return res.status(403).json({ message: 'No site associated with this user' });
    }
    
    // Pull the action filter from the query parameters if provided
    const { action } = req.query;
    const now = new Date();
    const fortyEightHoursAgo = new Date(now - 48 * 60 * 60 * 1000);

    // Match stage – include the action filter if provided
    const matchStage = {
      timestamp: { $gte: fortyEightHoursAgo },
      site: user.site._id
    };
    
    if (action) {
      matchStage.action = action;
    }

    // Run the MongoDB aggregation to get existing data points
    const aggregatedData = await Log.aggregate([
      { 
        $match: matchStage 
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            hour: { $hour: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { 
          "_id.year": 1, 
          "_id.month": 1, 
          "_id.day": 1, 
          "_id.hour": 1 
        }
      }
    ]);

    // Format the results from aggregation
    const formattedData = aggregatedData.map(item => {
      const { year, month, day, hour } = item._id;
      return {
        timePeriod: `${month}/${day}/${year} ${hour}:00`,
        count: item.count
      };
    });

    console.log('Raw aggregated data points:', formattedData.length);

    // Create a map of existing data points for quick lookup
    const dataMap = {};
    formattedData.forEach(item => {
      dataMap[item.timePeriod] = item.count;
    });

    // Fill in all hours in the 48-hour period, even if no data exists
    const filledTimeSeries = [];
    
    // Clone the fortyEightHoursAgo date to avoid modifying the original
    for (let d = new Date(fortyEightHoursAgo); d <= now; d.setHours(d.getHours() + 1)) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hour = d.getHours();
      
      const timePeriod = `${month}/${day}/${year} ${hour}:00`;
      
      filledTimeSeries.push({
        timePeriod: timePeriod,
        count: dataMap[timePeriod] || 0  // Use 0 if no data for this hour
      });
    }

    console.log('Filled time series points:', filledTimeSeries.length);
    
    // Return the filled time series instead of the original data
    res.json(filledTimeSeries);
  } catch (error) {
    console.error('Error in timeseries aggregation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getLogsTimeSeries };
