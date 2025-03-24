const Log = require("../models/logModel");

/**
 * Checks if a user or IP has exceeded a threshold of failed logins in a given timeframe.
 * @param {string} userId - The user ID to check logs for.
 * @param {string} ip - The IP address to check logs for (optional).
 * @returns {boolean} - True if suspicious, false otherwise.
 */
async function checkFailedLogins(userId, ip) {
  const TIME_WINDOW_MINUTES = 15;  //minutes for the window
  const FAIL_THRESHOLD = 5;       // here we put the logins in the window to be considered suspicious

  // Calculate the time boundary
  const timeBoundary = new Date(Date.now() - TIME_WINDOW_MINUTES * 60 * 1000);

  // Find logs in the last 15 minutes for this user or IP
  const query = {
    action: "failed_login",
    timestamp: { $gte: timeBoundary },
    $or: [
      { userId: userId },
      { ipAddress: ip }
    ]
  };
  // If you want to check either user or IP, you can do:
  if (userId) query.userId = userId;
  if (ip) query.ipAddress = ip;

  const failedLogs = await Log.find(query).countDocuments();

  // If the number of failed attempts is above threshold, suspicious
  return failedLogs >= FAIL_THRESHOLD;
}

module.exports = { checkFailedLogins };
