const { getSocket } = require('../socket');
const Log = require('../models/logModel');
const Alert = require('../models/alertModel');

// Thresholds for different types of anomalies
const THRESHOLDS = {
  FAILED_LOGIN: 10,           // 10 failed logins in 5 minutes
  BRUTE_FORCE: 30,            // 30 attempts on same account in 10 minutes
  ACCOUNT_TAKEOVER: 5,        // 5 password changes in 24 hours
  SUSPICIOUS_IPS: 15,         // 15 requests from known suspicious IPs
  API_ABUSE: 50               // 50 API calls in 1 minute
};

// Time windows for different checks (in milliseconds)
const TIME_WINDOWS = {
  SHORT: 5 * 60 * 1000,       // 5 minutes
  MEDIUM: 10 * 60 * 1000,     // 10 minutes
  LONG: 60 * 60 * 1000,       // 1 hour
  DAY: 24 * 60 * 60 * 1000    // 24 hours
};

// Get the socket instance
const getIo = () => {
  const io = getSocket();
  if (!io) {
    console.error('Socket.io not initialized');
    return null;
  }
  return io;
};

// Check for failed login threats
const checkForFailedLoginThreat = async (siteId) => {
  console.log(`Starting failed login check for site ${siteId}`);
  
  const io = getIo();
  if (!io) {
    console.error('Socket.io not initialized in anomaly detection');
    return;
  } else {
    console.log('Socket.io available for alerts');
  }
  
  try {
    const timeBoundary = new Date(Date.now() - TIME_WINDOWS.SHORT);
    
    // Find all logs for this check
    const logs = await Log.find({
      site: siteId,
      action: "failed_login",
      timestamp: { $gte: timeBoundary }
    });
    
    const count = logs.length;
    console.log(`Found ${count} failed login attempts (threshold: ${THRESHOLDS.FAILED_LOGIN})`);

    if (count >= THRESHOLDS.FAILED_LOGIN) {
      console.log(`THRESHOLD REACHED: Creating alert for ${count} failed logins`);
      
      // Create alert in the database
      const alert = new Alert({
        message: `High failed login rate detected! ${count} failures in 5 minutes.`,
        severity: 'High',
        type: 'failed_login',
        siteId: siteId,
        timestamp: new Date(),
        relatedLogs: logs.map(log => log._id)
      });
      
      await alert.save();
      console.log(`Alert saved to database with ID: ${alert._id}`);
      
      // Send alert through socket
      console.log(`Attempting to emit alert to room ${siteId}`);
      console.log('Alert data:', JSON.stringify(alert));
      
      try {
        io.to(siteId.toString()).emit('alert', alert);
        console.log(`Alert emitted to room ${siteId}`);
        
        // Also emit globally for testing
        io.emit('alert', alert);
        console.log('Alert also emitted globally');
      } catch (socketError) {
        console.error('Error emitting socket event:', socketError);
      }
    }
  } catch (error) {
    console.error('Error checking failed login threat:', error);
  }
};


// Check for brute force attacks (many attempts on same account)
const checkForBruteForceAttacks = async (siteId) => {
  const io = getIo();
  
  try {
    const timeBoundary = new Date(Date.now() - TIME_WINDOWS.MEDIUM);
    
    // Get all failed logins in the time window
    const logs = await Log.find({
      site: siteId,
      action: "failed_login",
      timestamp: { $gte: timeBoundary }
    });
    
    // Group by username to find targeted accounts
    const accountAttempts = {};
    logs.forEach(log => {
      const username = log.username || log.userId || 'unknown';
      
      if (!accountAttempts[username]) {
        accountAttempts[username] = {
          count: 0,
          logs: []
        };
      }
      
      accountAttempts[username].count++;
      accountAttempts[username].logs.push(log._id);
    });
    
    // Check if any account exceeds threshold
    for (const [username, data] of Object.entries(accountAttempts)) {
      if (data.count >= THRESHOLDS.BRUTE_FORCE) {
        console.log(`Brute force attack detected on account: ${username} with ${data.count} attempts for site ${siteId}`);
        
        // Create alert in the database
        const alert = new Alert({
          message: `Possible brute force attack detected on account: ${username}`,
          details: `${data.count} login attempts in the last 10 minutes`,
          severity: 'Critical',
          type: 'brute_force',
          siteId: siteId,
          targetUser: username,
          timestamp: new Date(),
          relatedLogs: data.logs
        });
        
        await alert.save();
        
        // Send alert through socket
        if (io) {
          io.to(siteId.toString()).emit('alert', alert);
        }
      }
    }
  } catch (error) {
    console.error('Error checking brute force attacks:', error);
  }
};

// Check for suspicious IPs (using a hypothetical list or pattern)
const checkForSuspiciousIPs = async (siteId) => {
  const io = getIo();
  
  try {
    const timeBoundary = new Date(Date.now() - TIME_WINDOWS.SHORT);
    
    // Get all logs with IP information in the time window
    const logs = await Log.find({
      site: siteId,
      timestamp: { $gte: timeBoundary },
      // Assuming IP is stored in one of these fields
      $or: [
        { ip: { $exists: true } },
        { ipAddress: { $exists: true } }
      ]
    });
    
    // Analyze for suspicious patterns
    const suspiciousIPs = {};
    
    logs.forEach(log => {
      const ip = log.ip || log.ipAddress;
      if (!ip) return;
      
      // Check if IP matches suspicious patterns (example: private IPs trying to access public services)
      const isSuspicious = ip.startsWith('192.168.') || ip.startsWith('10.') || 
                          isBannedIP(ip) || isFromSuspiciousCountry(ip);
      
      if (isSuspicious) {
        if (!suspiciousIPs[ip]) {
          suspiciousIPs[ip] = {
            count: 0,
            logs: []
          };
        }
        
        suspiciousIPs[ip].count++;
        suspiciousIPs[ip].logs.push(log._id);
      }
    });
    
    // Check if suspicious IP activity exceeds threshold
    for (const [ip, data] of Object.entries(suspiciousIPs)) {
      if (data.count >= THRESHOLDS.SUSPICIOUS_IPS) {
        console.log(`Suspicious activity from IP: ${ip} with ${data.count} requests for site ${siteId}`);
        
        // Create alert in the database
        const alert = new Alert({
          message: `Suspicious IP address detected: ${ip}`,
          details: `${data.count} requests in the last 5 minutes from a potentially malicious source`,
          severity: 'High',
          type: 'suspicious_ip',
          siteId: siteId,
          sourceIP: ip,
          timestamp: new Date(),
          relatedLogs: data.logs
        });
        
        await alert.save();
        
        // Send alert through socket
        if (io) {
          io.to(siteId.toString()).emit('alert', alert);
        }
      }
    }
  } catch (error) {
    console.error('Error checking suspicious IPs:', error);
  }
};

// Check for API abuse (high frequency of API calls)
const checkForAPIAbuse = async (siteId) => {
  const io = getIo();
  
  try {
    const timeBoundary = new Date(Date.now() - 60 * 1000); // Last minute
    
    // Get all API calls in the last minute
    const logs = await Log.find({
      site: siteId,
      action: { $regex: /^api_/ }, // Assuming API logs have api_ prefix
      timestamp: { $gte: timeBoundary }
    });
    
    // Group by user/IP to find abusers
    const apiCalls = {};
    
    logs.forEach(log => {
      const identifier = log.userId || log.username || log.ip || log.ipAddress || 'unknown';
      
      if (!apiCalls[identifier]) {
        apiCalls[identifier] = {
          count: 0,
          logs: []
        };
      }
      
      apiCalls[identifier].count++;
      apiCalls[identifier].logs.push(log._id);
    });
    
    // Check if any user exceeds threshold
    for (const [identifier, data] of Object.entries(apiCalls)) {
      if (data.count >= THRESHOLDS.API_ABUSE) {
        console.log(`API abuse detected from: ${identifier} with ${data.count} calls for site ${siteId}`);
        
        // Create alert in the database
        const alert = new Alert({
          message: `Possible API abuse detected`,
          details: `${data.count} API calls in the last minute from ${identifier}`,
          severity: 'Medium',
          type: 'api_abuse',
          siteId: siteId,
          sourceIP: identifier.includes('.') ? identifier : null, // Only use as IP if it looks like one
          targetUser: !identifier.includes('.') ? identifier : null, // Only use as user if not an IP
          timestamp: new Date(),
          relatedLogs: data.logs
        });
        
        await alert.save();
        
        // Send alert through socket
        if (io) {
          io.to(siteId.toString()).emit('alert', alert);
        }
      }
    }
  } catch (error) {
    console.error('Error checking API abuse:', error);
  }
};

// Placeholder functions that would be implemented in a real system
function isBannedIP(ip) {
  // In reality, you would check against a threat intelligence database
  const bannedIPs = ['1.2.3.4', '5.6.7.8']; // Example
  return bannedIPs.includes(ip);
}

function isFromSuspiciousCountry(ip) {
  // In reality, you would use a geolocation service
  return false; // Placeholder implementation
}

// Run all checks for a specific site
const runAllChecks = async (siteId) => {
  await checkForFailedLoginThreat(siteId);
  await checkForBruteForceAttacks(siteId);
  await checkForSuspiciousIPs(siteId);
  await checkForAPIAbuse(siteId);
};

// Run checks for all sites (to be called by a scheduler)
const runChecksForAllSites = async () => {
  try {
    // Get all active sites (implement this method in your Site model)
    const Site = require('../models/siteModel');
    const sites = await Site.find({ status: 'active' });
    
    // Run checks for each site
    for (const site of sites) {
      await runAllChecks(site._id);
    }
    
    console.log(`Anomaly detection completed for ${sites.length} sites`);
  } catch (error) {
    console.error('Error running anomaly detection for all sites:', error);
  }
};

module.exports = { 
  checkForFailedLoginThreat,
  checkForBruteForceAttacks,
  checkForSuspiciousIPs,
  checkForAPIAbuse,
  runAllChecks,
  runChecksForAllSites
};