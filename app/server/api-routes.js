const databaseController = require('../controllers/database_controller.js');

module.exports = function(app) {
  
  app.get('/api/data/historical', async (req, res) => {
    try {
      const { start, end } = req.query;
      
      if (!start || !end) {
        return res.status(400).json({ 
          error: 'Start and end dates are required' 
        });
      }

      const timeRange = {
        start: new Date(start),
        end: new Date(end)
      };

      const data = await databaseController.getHistoricalData(timeRange);
      const stats = await databaseController.getStats(timeRange);

      res.json({ data, stats });
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get heart rate statistics
  app.get('/api/data/stats', async (req, res) => {
    try {
      const { start, end } = req.query;
      
      if (!start || !end) {
        return res.status(400).json({ 
          error: 'Start and end dates are required' 
        });
      }

      const timeRange = {
        start: new Date(start),
        end: new Date(end)
      };

      const stats = await databaseController.getStats(timeRange);
      res.json(stats);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get recent data (last hour)
  app.get('/api/data/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - (60 * 60 * 1000)); // Last hour
      
      const data = await databaseController.getHistoricalData({
        start: startTime,
        end: endTime
      }, limit);
      
      res.json(data);
    } catch (error) {
      console.error('❌ Error fetching recent data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};