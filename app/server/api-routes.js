
module.exports = function(app) {
  // Get historical heart rate data

  const databaseController = require('../../controllers/database_controller.js');
  
  app.get('/api/data/historical', async (req, res) => {
    try {
      const { start, end, limit } = req.query;
      
      if (!start || !end) {
        return res.status(400).json({ 
          error: 'Start and end dates are required' 
        });
      }

      const timeRange = {
        start: new Date(start),
        end: new Date(end)
      };

      const dataLimit = limit ? parseInt(limit) : 1000;
      const data = await databaseController.getHistoricalData(timeRange, dataLimit);
      const stats = await databaseController.getStats(timeRange);

      res.json({ 
        data, 
        stats,
        timeRange: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString()
        },
        meta: {
          totalRecords: data.length,
          limit: dataLimit
        }
      });
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get time range presets
  app.get('/api/data/time-ranges', (req, res) => {
    try {
      const presets = databaseController.getTimeRangePresets();
      res.json(presets);
    } catch (error) {
      console.error('❌ Error fetching time ranges:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Time range presets configuration
  const timeRangePresets = {
    '5min': { minutes: 5, label: 'Last 5 Minutes' },
    '15min': { minutes: 15, label: 'Last 15 Minutes' },
    '1hour': { hours: 1, label: 'Last 1 Hour' },
    '6hours': { hours: 6, label: 'Last 6 Hours' },
    '24hours': { hours: 24, label: 'Last 24 Hours' },
    '7days': { days: 7, label: 'Last 7 Days' }
  };

  // Get data for specific preset (5min, 1hour, 24hours, etc.)
  app.get('/api/data/preset/:preset', async (req, res) => {
    try {
      const { preset } = req.params;
      const { limit } = req.query;
      
      if (!timeRangePresets[preset]) {
        return res.status(400).json({ 
          error: 'Invalid preset. Available: ' + Object.keys(timeRangePresets).join(', ')
        });
      }

      const config = timeRangePresets[preset];
      const endTime = new Date();
      let startTime;

      // Calculate start time based on preset
      if (config.minutes) {
        startTime = new Date(endTime.getTime() - config.minutes * 60 * 1000);
      } else if (config.hours) {
        startTime = new Date(endTime.getTime() - config.hours * 60 * 60 * 1000);
      } else if (config.days) {
        startTime = new Date(endTime.getTime() - config.days * 24 * 60 * 60 * 1000);
      }

      const timeRange = { start: startTime, end: endTime };
      const dataLimit = limit ? parseInt(limit) : 1000;
      
      const data = await databaseController.getHistoricalData(timeRange, dataLimit);
      const stats = await databaseController.getStats(timeRange);

      res.json({ 
        data, 
        stats,
        timeRange: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString(),
          label: config.label
        },
        meta: {
          preset,
          totalRecords: data.length,
          limit: dataLimit
        }
      });
    } catch (error) {
      console.error('❌ Error fetching preset data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get heart rate statistics only
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

  // Get recent data (last hour by default)
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