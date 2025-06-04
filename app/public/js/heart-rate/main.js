class HeartRateMonitor {
  constructor() {
    this.websocketClient = new WebSocketClient();
    this.chartManager = new ChartManager();
    this.statsManager = new StatsManager();
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log('Initializing Heart Rate Monitor...');
      
      this.setupEventListeners();
      this.websocketClient.init();
      await this.chartManager.init();
      
      this.setupWebSocketCallbacks();
      this.websocketClient.requestRecentData();
      
      this.isInitialized = true;
      console.log('Heart Rate Monitor initialized successfully');
    } catch (error) {
      console.error('Initialization failed:', error);
      this.showError('Failed to initialize the application');
    }
  }

  setupEventListeners() {
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => {
        this.clearData();
      });
    }

    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    window.addEventListener('resize', Utils.debounce(() => {
      if (this.chartManager && this.chartManager.isInitialized) {
        this.chartManager.updateData(this.websocketClient.getHeartRateData());
      }
    }, 250));
  }

  setupWebSocketCallbacks() {
    this.websocketClient.on('onConnect', () => {
      console.log('WebSocket connected');
      Utils.showNotification('Connected to heart rate monitor', 'success');
    });

    this.websocketClient.on('onDisconnect', () => {
      console.log('WebSocket disconnected');
      Utils.showNotification('Disconnected from heart rate monitor', 'warning');
    });

    this.websocketClient.on('onData', (newData, allData) => {
      const dataToUpdate = allData || this.websocketClient.getHeartRateData();
      this.updateDisplay(dataToUpdate);
      
      if (newData && Utils.isValidHeartRate(newData.heartRate)) {
        console.log(`New heart rate reading: ${newData.heartRate} BPM`);
      }
    });

    this.websocketClient.on('onConnectionStatus', (status) => {
      if (status.error) {
        Utils.showNotification(`Connection error: ${status.error}`, 'error');
      }
      
      if (status.maxRetriesReached) {
        this.showError('Unable to connect to heart rate server after multiple attempts');
      }
    });
  }

  updateDisplay(data) {
    if (!this.isInitialized) return;

    try {
      this.statsManager.updateStats(data);
      this.chartManager.updateData(data);
    } catch (error) {
      console.error('Display update error:', error);
    }
  }

  clearData() {
    if (!confirm('Are you sure you want to clear all data?')) {
      return;
    }

    try {
      this.websocketClient.clearData();
      this.statsManager.clear();
      this.chartManager.clear();
      Utils.showNotification('Data cleared successfully', 'info');
    } catch (error) {
      console.error('Clear data error:', error);
      Utils.showNotification('Failed to clear data', 'error');
    }
  }

  showError(message) {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorModal && errorMessage) {
      errorMessage.textContent = message;
      errorModal.style.display = 'flex';
    } else {
      alert(message);
    }
  }

  cleanup() {
    if (this.chartManager) {
      this.chartManager.dispose();
    }
  }
}

function closeErrorModal() {
  const errorModal = document.getElementById('errorModal');
  if (errorModal) {
    errorModal.style.display = 'none';
  }
}

window.closeErrorModal = closeErrorModal;

document.addEventListener('DOMContentLoaded', () => {
  const monitor = new HeartRateMonitor();
  monitor.init().catch(error => {
    console.error('Failed to start Heart Rate Monitor:', error);
  });
});