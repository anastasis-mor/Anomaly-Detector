const User = require("../models/userModel");
const Log = require("../models/logModel");

const getAllUsers = async (req, res) => {
    try {
      // Fetch all users from the DB
      const users = await User.find({});
      // Return them in JSON format
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Server error", details: error.message });
    }
  };

  const logs = async (req, res) => {
    try {
      const user = await User.findById(req.userId).populate('site');
  
      // If user is admin, return all logs (or all logs for that site).
      if (user.role === 'admin') {
        let allLogs;
        if (user.site && user.site._id) {
          allLogs = await Log.find({ site: user.site._id });
        } else {
          // For admin without a site, return all logs
          allLogs = await Log.find({});
        }
        return res.json(allLogs);
      }
  
      // If user is normal user, only return logs for that user's site or specifically that user
      const userLogs = await Log.find({ user: user._id, site: user.site._id ? user.site._id : null});
      return res.json(userLogs);
  
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };

  module.exports = { getAllUsers, logs };