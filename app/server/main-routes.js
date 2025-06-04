const path = require('path');

module.exports = function(app) {
  // Main heart rate monitor page
  app.get('/', (req, res) => {
      res.sendFile(__dirname + '/views/heart-rate-monitor.html');
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Error page
  app.get('/error', (req, res) => {
    res.status(404);
    res.sendFile(__dirname + '/views/error.html');
  });

  // 404 handler - must be last
  app.get('*', (req, res) => {
    res.status(404);
    res.sendFile(__dirname + '/views/error.html');
  });
};