const User = require("../models/userModel");
const Log = require("../models/logModel");

const fetchLogs = async (req, res, next) => {
  try {
    // Extract query parameters with defaults
    const { page = 1, limit = 20, action, startDate, endDate } = req.query;
    const query = {};

    // Filter by action type
    if (action) {
      query.action = action;
    }

    // Filter by a date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Get the logged-in user from the JWT (set by your auth middleware)
    const user = await User.findById(req.userId).populate('site');

    // For admin users, if they have a site, filter logs by that site
    if (user.role === 'admin') {
      if (user.site && user.site._id) {
        query.site = user.site._id;
      }
    } else {
        if (!user.site) {
            return res.json({ logs: [], totalPages: 0, currentPage: 1 });
          }
      // For non-admin users, filter logs by their site or user id as appropriate
      // Here we filter by site; alternatively, we might choose:
      //query.userId = user._id;
      query.site = user.site._id;
      
    }

    // Query the logs collection with pagination
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const count = await Log.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { fetchLogs };
