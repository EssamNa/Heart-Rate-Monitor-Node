class TimeRangeSelector {
  constructor(containerId, onRangeChange) {
    this.container = document.getElementById(containerId);
    this.onRangeChange = onRangeChange;
    this.currentRange = '1h'; // Default range
    this.timeRanges = [
      { key: '5m', label: 'Last 5 minutes' },
      { key: '15m', label: 'Last 15 minutes' },
      { key: '30m', label: 'Last 30 minutes' },
      { key: '1h', label: 'Last 1 hour' },
      { key: '6h', label: 'Last 6 hours' },
      { key: '12h', label: 'Last 12 hours' },
      { key: '1d', label: 'Last 1 day' },
      { key: '7d', label: 'Last 7 days' }
    ];
    
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const html = `
      <div class="time-range-selector">
        <h3>Select Time Range</h3>
        <div class="range-buttons">
          ${this.timeRanges.map(range => `
            <button 
              class="range-btn ${range.key === this.currentRange ? 'active' : ''}" 
              data-range="${range.key}"
            >
              ${range.label}
            </button>
          `).join('')}
        </div>
        
        <div class="custom-range">
          <h4>Custom Range</h4>
          <div class="custom-inputs">
            <label>
              From:
              <input type="datetime-local" id="customStart" />
            </label>
            <label>
              To:
              <input type="datetime-local" id="customEnd" />
            </label>
            <button id="applyCustomRange" class="btn btn-primary">Apply</button>
          </div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
  }

  attachEventListeners() {
    // Predefined range buttons
    const rangeButtons = this.container.querySelectorAll('.range-btn');
    rangeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const range = e.target.dataset.range;
        this.selectRange(range);
      });
    });

    // Custom range
    const applyButton = this.container.querySelector('#applyCustomRange');
    applyButton.addEventListener('click', () => {
      this.applyCustomRange();
    });

    // Set default values for custom inputs
    this.setDefaultCustomValues();
  }

  selectRange(rangeKey) {
    // Update active button
    this.container.querySelectorAll('.range-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    this.container.querySelector(`[data-range="${rangeKey}"]`).classList.add('active');
    
    this.currentRange = rangeKey;
    
    // Trigger callback
    if (this.onRangeChange) {
      this.onRangeChange(rangeKey, 'predefined');
    }
  }

  applyCustomRange() {
    const startInput = this.container.querySelector('#customStart');
    const endInput = this.container.querySelector('#customEnd');
    
    const start = new Date(startInput.value);
    const end = new Date(endInput.value);

    if (!startInput.value || !endInput.value) {
      alert('Please select both start and end dates');
      return;
    }

    if (start >= end) {
      alert('Start date must be before end date');
      return;
    }

    // Remove active class from predefined buttons
    this.container.querySelectorAll('.range-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Trigger callback with custom range
    if (this.onRangeChange) {
      this.onRangeChange({
        start: start.toISOString(),
        end: end.toISOString()
      }, 'custom');
    }
  }

  setDefaultCustomValues() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    
    // Format for datetime-local input
    const formatForInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    this.container.querySelector('#customStart').value = formatForInput(oneHourAgo);
    this.container.querySelector('#customEnd').value = formatForInput(now);
  }

  getCurrentRange() {
    return this.currentRange;
  }
}