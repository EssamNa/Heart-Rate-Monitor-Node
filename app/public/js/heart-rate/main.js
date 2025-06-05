class HeartRateMonitor {
  constructor() {
    this.websocketClient = new WebSocketClient();
    this.chartManager = new ChartManager();
    this.statsManager = new StatsManager();
    this.historicalDataManager = new HistoricalDataManager(); // Added historical data manager
    this.isInitialized = false;
    this.isHistoricalMode = false; // Track current mode
    this.timeRangePresets = {
      '5min': 5,
      '15min': 15,
      '1hour': 60,
      '6hours': 360,
      '24hours': 1440,
      '7days': 10080
    };
  }

  async init() {
    try {
      console.log('Initializing Heart Rate Monitor...');
      
      this.setupEventListeners();
      this.websocketClient.init();
      await this.chartManager.init();
      
      // Initialize historical data manager
      this.historicalDataManager.init(
        this.onHistoricalDataUpdate.bind(this),
        this.onHistoricalStatsUpdate.bind(this)
      );
      
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
        const currentData = this.isHistoricalMode 
          ? this.historicalDataManager.getCurrentData().data
          : this.websocketClient.getHeartRateData();
        this.chartManager.updateData(currentData);
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
      // Only update live data if not in historical mode
      if (!this.isHistoricalMode) {
        const dataToUpdate = allData || this.websocketClient.getHeartRateData();
        this.updateDisplay(dataToUpdate);
        
        if (newData && Utils.isValidHeartRate(newData.heartRate)) {
          //console.log(`New heart rate reading: ${newData.heartRate} BPM`);
        }
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

  // New: Handle historical data updates
  onHistoricalDataUpdate(data, isHistorical, range) {
    this.isHistoricalMode = isHistorical;
    if (isHistorical) {
      const timeinMins = this.timeRangePresets["" + range];
      console.log(`📊 Switched to historical mode: ${data.length} records & timeinMins ${timeinMins}`);
      Utils.showNotification(`Viewing historical data (${data.length} records)`, 'info');
      
      // Update chart with historical data
      this.chartManager.updateHistoricalData(data, true, timeinMins);
      
      // Update clear button text
      this.updateClearButtonText('Return to Live View');
    } else {
      console.log('🔴 Returned to live mode');
      Utils.showNotification('Returned to live view', 'info');
      
      // Return to live data
      const liveData = this.websocketClient.getHeartRateData();
      this.chartManager.updateData(liveData, false);
      this.statsManager.updateStats(liveData);
      
      // Reset clear button text
      this.updateClearButtonText('Clear Data');
    }
  }

  // New: Handle historical stats updates
  onHistoricalStatsUpdate(stats) {
    this.statsManager.updateStatsFromData(stats);
  }

  // New: Update clear button text based on mode
  updateClearButtonText(text) {
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
      clearDataBtn.textContent = text;
    }
  }

  updateDisplay(data) {
    if (!this.isInitialized || this.isHistoricalMode) return;
    
    try {
      this.statsManager.updateStats(data);
      this.chartManager.updateData(data);
    } catch (error) {
      console.error('Display update error:', error);
    }
  }

  clearData() {
    if (this.isHistoricalMode) {
      // Return to live view
      this.historicalDataManager.returnToLiveView();
      return;
    }

    // Clear live data (existing functionality)
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

  // New: Get current mode information
  getCurrentMode() {
    return {
      isHistorical: this.isHistoricalMode,
      data: this.isHistoricalMode 
        ? this.historicalDataManager.getCurrentData()
        : this.websocketClient.getHeartRateData()
    };
  }

  // New: Switch to specific historical preset
  async loadHistoricalPreset(preset) {
    try {
      await this.historicalDataManager.loadPresetData(preset);
      Utils.showNotification(`Loaded ${preset} historical data`, 'success');
    } catch (error) {
      console.error('Failed to load historical preset:', error);
      Utils.showNotification(`Failed to load ${preset} data`, 'error');
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

// Existing global functions
function closeErrorModal() {
  const errorModal = document.getElementById('errorModal');
  if (errorModal) {
    errorModal.style.display = 'none';
  }
}

// Make global for HTML onclick handlers
window.closeErrorModal = closeErrorModal;

// Global monitor instance for debugging/external access
let monitor = null;

document.addEventListener('DOMContentLoaded', () => {
  monitor = new HeartRateMonitor();
  
  // Make monitor globally accessible for debugging
  window.heartRateMonitor = monitor;
  
  monitor.init().catch(error => {
    console.error('Failed to start Heart Rate Monitor:', error);
  });
});

// Export for external use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeartRateMonitor;
}