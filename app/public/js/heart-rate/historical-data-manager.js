class HistoricalDataManager {
  constructor() {
    this.currentData = [];
    this.currentStats = {};
    this.currentTimeRange = null;
    this.isHistoricalMode = false;
    this.onDataUpdateCallback = null;
    this.onStatsUpdateCallback = null;
  }

  init(onDataUpdate, onStatsUpdate) {
    this.onDataUpdateCallback = onDataUpdate;
    this.onStatsUpdateCallback = onStatsUpdate;
    this.setupTimeRangeSelector();
  }

  setupTimeRangeSelector() {
    const timeButtons = document.querySelectorAll('.time-btn');
    
    timeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const range = e.target.dataset.range;
        
        if (range === 'live') {
          this.returnToLiveView();
        } else {
          this.loadTimeRange(range, button);
        }
      });
    });

    // Set live view as active by default
    this.setActiveButton('live');
  }

  async loadTimeRange(range, buttonElement) {
    try {
      // Show loading state
      this.setLoadingState(buttonElement, true);
      
      console.log(`📊 Loading ${range} data...`);
      
      const response = await fetch(`/api/data/preset/${range}?limit=1000`);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      console.log(`📊 result ${result.data.length}`);
      // Update state
      this.currentData = result.data;
      this.currentStats = result.stats;
      this.currentTimeRange = result.timeRange;
      this.isHistoricalMode = true;

      // Update UI
      this.setActiveButton(range);
      this.updateModeIndicator(true, result.timeRange.label);
      this.updateTimeRangeInfo(result);
      
      // Trigger callbacks
      if (this.onDataUpdateCallback) {
        this.onDataUpdateCallback(this.currentData, true, range);
      }
      
      if (this.onStatsUpdateCallback) {
        this.onStatsUpdateCallback(this.currentStats);
      }

      console.log(`✅ Loaded ${result.data.length} records for ${range}`);

    } catch (error) {
      console.error(`❌ Error loading ${range} data:`, error);
      Utils.showNotification(`Failed to load ${range} data`, 'error');
    } finally {
      this.setLoadingState(buttonElement, false);
    }
  }

  returnToLiveView() {
    console.log('🔴 Returning to live view');
    
    // Reset state
    this.currentData = [];
    this.currentStats = {};
    this.currentTimeRange = null;
    this.isHistoricalMode = false;
    
    // Update UI
    this.setActiveButton('live');
    this.updateModeIndicator(false);
    this.hideTimeRangeInfo();
    
    // Trigger callback to return to live mode
    if (this.onDataUpdateCallback) {
      this.onDataUpdateCallback([], false);
    }
  }

  setActiveButton(activeRange) {
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.range === activeRange) {
        btn.classList.add('active');
      }
    });
  }

  setLoadingState(button, isLoading) {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  updateModeIndicator(isHistorical, label = '') {
    const modeText = document.getElementById('currentModeText');
    const modeDot = document.getElementById('modeDot');
    
    if (modeText && modeDot) {
      if (isHistorical) {
        modeText.textContent = `Historical: ${label}`;
        modeDot.classList.add('historical');
      } else {
        modeText.textContent = 'Live View';
        modeDot.classList.remove('historical');
      }
    }
  }

  updateTimeRangeInfo(result) {
    const timeRangeInfo = document.getElementById('timeRangeInfo');
    const recordCount = document.getElementById('recordCount');
    const timeRangeText = document.getElementById('timeRangeText');
    
    if (timeRangeInfo && recordCount && timeRangeText) {
      recordCount.textContent = result.data.length;
      
      const startTime = new Date(result.timeRange.start).toLocaleString();
      const endTime = new Date(result.timeRange.end).toLocaleString();
      timeRangeText.textContent = `${startTime} to ${endTime}`;
      
      timeRangeInfo.style.display = 'block';
    }
  }

  hideTimeRangeInfo() {
    const timeRangeInfo = document.getElementById('timeRangeInfo');
    if (timeRangeInfo) {
      timeRangeInfo.style.display = 'none';
    }
  }

  // Getter methods
  getCurrentData() {
    return {
      data: this.currentData,
      stats: this.currentStats,
      timeRange: this.currentTimeRange
    };
  }

  isInHistoricalMode() {
    return this.isHistoricalMode;
  }
}