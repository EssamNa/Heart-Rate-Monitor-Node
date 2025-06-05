class WebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.heartRateData = [];
    this.maxDataPoints = 100;
    this.connectionStatusElement = document.getElementById('connectionStatus');
    this.callbacks = {
      onConnect: [],
      onDisconnect: [],
      onData: [],
      onConnectionStatus: []
    };
  }

  init() {
    this.socket = io();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.updateConnectionStatus('connected', 'Connected');
      this.triggerCallbacks('onConnect');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      this.updateConnectionStatus('disconnected', 'Disconnected');
      this.triggerCallbacks('onDisconnect');
    });

    this.socket.on('connectionStatus', (status) => {
      console.log('Connection status:', status);
      this.updateConnectionStatus(
        status.connected ? 'connected' : 'error',
        status.connected ? 'Connected' : status.error || 'Connection Error'
      );
      this.triggerCallbacks('onConnectionStatus', status);
    });

    this.socket.on('heartRateData', (data) => {
      //console.log('Received heart rate data:', data);
      this.addHeartRateData(data);
      this.triggerCallbacks('onData', data);
    });

    this.socket.on('recentData', (data) => {
      console.log('Received recent data:', data.length, 'points');
      //this.heartRateData = data.slice(-this.maxDataPoints);
      //this.triggerCallbacks('onData', null, this.heartRateData);
    });
  }

  updateConnectionStatus(status, text) {
    if (this.connectionStatusElement) {
      const indicator = this.connectionStatusElement.querySelector('.status-indicator');
      const textElement = this.connectionStatusElement.querySelector('.status-text');
      
      if (indicator) {
        indicator.className = `status-indicator status-${status}`;
      }
      
      if (textElement) {
        textElement.textContent = text;
      }
    }
  }

  addHeartRateData(data) {
    if (data && Utils.isValidHeartRate(data.heartRate)) {
      this.heartRateData.push({
        ...data,
        timestamp: new Date(data.timestamp)
      });
      
      if (this.heartRateData.length > this.maxDataPoints) {
        this.heartRateData = this.heartRateData.slice(-this.maxDataPoints);
      }
    }
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  triggerCallbacks(event, ...args) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Callback error:', error);
        }
      });
    }
  }

  clearData() {
    this.heartRateData = [];
    this.triggerCallbacks('onData', null, []);
  }

  requestRecentData() {
    if (this.socket) {
      this.socket.emit('requestRecentData');
    }
  }

  getHeartRateData() {
    return this.heartRateData;
  }

  getLatestReading() {
    return this.heartRateData.length > 0 ? this.heartRateData[this.heartRateData.length - 1] : null;
  }

  getStats() {
    return Utils.calculateStats(this.heartRateData);
  }
}

window.WebSocketClient = WebSocketClient;