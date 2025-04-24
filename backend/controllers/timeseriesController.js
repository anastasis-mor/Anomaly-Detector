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
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Match stage – include the action filter if provided
    const matchStage = {
      timestamp: { $gte: fortyEightHoursAgo },
      site: user.site._id
    };
    if (action) {
      matchStage.action = action;
    }

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

    // Format the results
    const formattedData = aggregatedData.map(item => {
      const { year, month, day, hour } = item._id;
      return {
        timePeriod: `${month}/${day}/${year} ${hour}:00`,
        count: item.count
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Error in timeseries aggregation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getLogsTimeSeries };
