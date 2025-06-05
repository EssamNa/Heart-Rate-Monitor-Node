class StatsManager {
  constructor() {
    this.minElement = document.getElementById('minBpm');
    this.maxElement = document.getElementById('maxBpm');
    this.avgElement = document.getElementById('avgBpm');
    this.countElement = document.getElementById('totalReadings');
    this.latestReadingElement = document.getElementById('latestReading');
    this.latestBpmElement = document.getElementById('latestBpm');
    this.readingTimeElement = document.getElementById('readingTime');
    this.currentStats = { min: 0, max: 0, average: 0, count: 0 };
  }

  updateStats(data) {
    if (!data || data.length === 0) {
      this.currentStats = { min: 0, max: 0, average: 0, count: 0 };
      this.hideLatestReading();
    } else {
      this.currentStats = Utils.calculateStats(data);
      this.updateLatestReading(data[data.length - 1]);
    }
    
    this.renderStats();
  }
  updateStatsFromData(data) {
    if (data == null) {
      this.currentStats = { min: 0, max: 0, average: 0, count: 0 };
      this.hideLatestReading();
    } else {
      this.currentStats = data;
      this.updateLatestReading(data);
    }
    this.renderStats();

  }

  renderStats() {
    if (this.minElement) {
      this.minElement.textContent = this.currentStats.min || '-';
    }
    
    if (this.maxElement) {
      this.maxElement.textContent = this.currentStats.max || '-';
    }
    
    if (this.avgElement) {
      this.avgElement.textContent = this.currentStats.average || '-';
    }
    
    if (this.countElement) {
      this.countElement.textContent = this.currentStats.count || '0';
    }
  }

  updateLatestReading(reading) {
    if (!reading) {
      this.hideLatestReading();
      return;
    }

    if (this.latestBpmElement) {
      this.latestBpmElement.textContent = reading.heartRate;
    }
    
    if (this.readingTimeElement) {
      this.readingTimeElement.textContent = Utils.formatDateTime(reading.timestamp);
    }
    
    this.showLatestReading();
  }

  showLatestReading() {
    if (this.latestReadingElement) {
      this.latestReadingElement.style.display = 'block';
    }
  }

  hideLatestReading() {
    if (this.latestReadingElement) {
      this.latestReadingElement.style.display = 'none';
    }
  }

  clear() {
    this.currentStats = { min: 0, max: 0, average: 0, count: 0 };
    this.renderStats();
    this.hideLatestReading();
  }

  animateValue(element, newValue) {
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const difference = newValue - currentValue;
    const steps = 20;
    const stepValue = difference / steps;
    let current = currentValue;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += stepValue;
      element.textContent = Math.round(current);
      
      if (step >= steps) {
        clearInterval(timer);
        element.textContent = newValue;
      }
    }, 25);
  }

  highlightChange(element, isIncrease) {
    if (!element) return;
    
    element.classList.add(isIncrease ? 'stat-increase' : 'stat-decrease');
    setTimeout(() => {
      element.classList.remove('stat-increase', 'stat-decrease');
    }, 1000);
  }

  getStats() {
    return this.currentStats;
  }
}

window.StatsManager = StatsManager;