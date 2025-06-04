const WebSocket = require('ws');
const config = require('../config/app_config.js');
const databaseController = require('./database_controller.js');

class WebSocketController {
  constructor() {
    this.io = null;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.isDebugMode = true; // Start with debug mode
  }

  init(io) {
    this.io = io;
    this.setupSocketIO();
    this.connectToHeartRateServer();
  }

  setupSocketIO() {
    this.io.on('connection', (socket) => {
      console.log(`👤 Client connected: ${socket.id}`);
      
      // Send connection status
      socket.emit('connectionStatus', {
        connected: this.ws && this.ws.readyState === WebSocket.OPEN,
        serverConnected: true
      });

      socket.on('disconnect', () => {
        console.log(`👋 Client disconnected: ${socket.id}`);
      });

      socket.on('requestRecentData', async () => {
        try {
          const endTime = new Date();
          const startTime = new Date(endTime.getTime() - (30 * 60 * 1000)); // Last 30 minutes
          
          const data = await databaseController.getHistoricalData({
            start: startTime,
            end: endTime
          }, 100);
          
          socket.emit('recentData', data);
        } catch (error) {
          console.error('❌ Error fetching recent data:', error);
        }
      });
    });
  }

  connectToHeartRateServer() {
    const wsUrl = this.isDebugMode ? config.wsDebugUrl : config.wsUrl;
    console.log(`🔌 Connecting to heart rate server: ${wsUrl}`);
    
    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      console.log('✅ Connected to heart rate WebSocket server');
      this.reconnectAttempts = 0;
      this.io.emit('connectionStatus', { connected: true });
    });

    this.ws.on('message', async (data) => {
      try {
        const heartRateData = this.parseMessage(data.toString());
        if (heartRateData) {
          // Save to database
          const savedData = await databaseController.saveHeartRateData(heartRateData);
          
          // Emit to all connected clients
          this.io.emit('heartRateData', savedData);
          
          //console.log(`💓 Heart rate data: ${heartRateData.heartRate} BPM`);
        }
      } catch (error) {
        console.error('❌ Error processing heart rate message:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.io.emit('connectionStatus', { connected: false, error: error.message });
    });

    this.ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
      this.io.emit('connectionStatus', { connected: false });
      this.handleReconnect();
    });
  }

  parseMessage(message) {
    try {
      // Handle JSON format
      const data = JSON.parse(message);
      
      let heartRate;
      if (typeof data === 'number') {
        heartRate = data;
      } else if (data.heartRate) {
        heartRate = data.heartRate;
      } else if (data.value) {
        heartRate = data.value;
      } else {
        return null;
      }

      return {
        heartRate,
        timestamp: new Date()
      };
    } catch (error) {
      // Handle plain number format
      const numValue = parseFloat(message.trim());
      if (!isNaN(numValue)) {
        return {
          heartRate: numValue,
          timestamp: new Date()
        };
      }
      
      console.warn('⚠️ Failed to parse message:', message);
      return null;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000);
      
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
      setTimeout(() => {
        this.connectToHeartRateServer();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.io.emit('connectionStatus', { 
        connected: false, 
        maxRetriesReached: true 
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

const websocketController = new WebSocketController();
module.exports = websocketController;