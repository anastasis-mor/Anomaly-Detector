(function() {
  // Configuration: Adjust these parameters as needed
  console.log('logApi.js loaded');
  const LOG_API_ENDPOINT = 'http://localhost:8080/api/integration/ingest-log'; // Your log ingestion endpoint
  const API_KEY = process.env.API_INGEST; // The API key provided to the client
  const FLUSH_INTERVAL_MS = 10000; // Flush batch every 10 seconds
  const MAX_BATCH_SIZE = 50;       // Flush immediately if this many events are collected
  const SAMPLING_RATE = 0.1;       // Only log 10% of clicks (adjust from 0 to 1)

  // In-memory buffer for click logs
  let clickLogs = [];

  // Function to flush the batch of logs to your REST API
  function flushLogs() {
    if (clickLogs.length === 0) return;

    // Copy the current batch and clear the buffer
    const batch = clickLogs.slice();
    clickLogs = [];

    // Send the batch using fetch
    fetch(LOG_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ logs: batch }) // You can design your backend to accept a batch payload
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(result) {
        console.log('Batch log sent successfully:', result);
      })
      .catch(function(error) {
        console.error('Error sending batch logs:', error);
      });
  }

  // Set up a periodic flush of the logs buffer
  setInterval(flushLogs, FLUSH_INTERVAL_MS);

  // Function to record a click event with sampling
  function recordClick(event) {
    // Sampling: only record the event if a random number is below the sampling rate
    if (Math.random() > SAMPLING_RATE) return;

    // Build the log data. You can include more metadata as needed.
    const logData = {
      action: 'click',
      timestamp: new Date().toISOString(),
      details: {
        element: event.target.tagName,
        id: event.target.id || null,
        class: event.target.className || null
      },
      pageUrl: window.location.href,
      // Note: The server will attach the IP address and the correct site based on the API key.
    };

    // Add the log to the batch
    clickLogs.push(logData);

    // If we've reached the max batch size, flush immediately
    if (clickLogs.length >= MAX_BATCH_SIZE) {
      flushLogs();
    }
  }

  // Attach an event listener for click events on the document
  document.addEventListener('click', recordClick);

  // Expose the logger to the global scope so custom events can be logged manually
  window.AnomalyLogger = {
    sendLog: function(data) {
      // Immediately send a manual log without batching
      if (!data.timestamp) {
        data.timestamp = new Date().toISOString();
      }
      data.pageUrl = window.location.href;
      data.userAgent = navigator.userAgent;
      fetch(LOG_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(data)
      })
        .then(function(response) {
          return response.json();
        })
        .then(function(result) {
          console.log('Manual log sent:', result);
        })
        .catch(function(error) {
          console.error('Error sending manual log:', error);
        });
    },
    // You can also add other helper functions for common events:
    logPageLoad: function() {
      this.sendLog({ action: 'page_load' });
    },
    logError: function(error) {
      this.sendLog({ action: 'error', details: error.toString() });
    },
    logRoleChange: function(oldRole, newRole) {
      this.sendLog({ action: 'role_change', details: { oldRole: oldRole, newRole: newRole } });
    }
  };

  // Optionally, automatically log the page load event
  window.addEventListener('load', function() {
    window.AnomalyLogger.logPageLoad();
  });

  // Optionally capture global errors
  window.onerror = function(message, source, lineno, colno, error) {
    window.AnomalyLogger.logError(message);
  };
})();
