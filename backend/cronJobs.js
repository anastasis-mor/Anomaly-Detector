const cron = require('node-cron');
const Log = require('./models/logModel');
const fs = require('fs');
const path = require('path');
const { checkForFailedLoginThreat } = require('./controllers/notifications');

// Schedule a cron job to run every day at 3:00 AM
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('Cron job started: Archiving logs older than 48 hours');
    
    // Calculate the cutoff date (48 hours ago)
    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    // Find logs older than the cutoff
    const oldLogs = await Log.find({ timestamp: { $lt: cutoffDate } });
    
    if (oldLogs.length > 0) {
      // Save to a file
      const archiveFile = path.join(__dirname, 'log-archives', `logs-${Date.now()}.json`);
      
      // Ensure the directory exists
      fs.mkdirSync(path.dirname(archiveFile), { recursive: true });
      
      fs.writeFileSync(archiveFile, JSON.stringify(oldLogs, null, 2), 'utf8');
      
      // Remove old logs from the primary collection
      await Log.deleteMany({ timestamp: { $lt: cutoffDate } });
      
      console.log(`Archived and removed ${oldLogs.length} logs`);
    } else {
      console.log('No logs to archive');
    }
  } catch (error) {
    console.error('Error during cron job:', error);
  }
  setInterval(() => {
    require('./notifications').checkForFailedLoginThreat();
  }, 60000);
});
