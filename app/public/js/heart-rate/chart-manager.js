class ChartManager {
  constructor() {
    this.chart = null;
    this.isInitialized = false;
    this.chartElement = document.getElementById('chartDiv');
    this.chartOverlay = document.getElementById('chartOverlay');
    this.chartStatus = document.getElementById('chartStatus');
    this.data = [];
  }

  async init() {
    try {
      this.updateStatus('Initializing chart...');
      
      if (!this.chartElement) {
        throw new Error('Chart element not found');
      }

      await this.waitForElement();
      await this.initializeAmCharts();
      
      this.isInitialized = true;
      this.updateStatus('Chart ready');
      this.hideOverlay();
      
      console.log('Chart initialized successfully');
    } catch (error) {
      console.error('Chart initialization failed:', error);
      this.updateStatus('Chart initialization failed');
      this.showError(error.message);
    }
  }

  async waitForElement() {
    return new Promise((resolve) => {
      const checkElement = () => {
        const rect = this.chartElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          resolve();
        } else {
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    });
  }

  async initializeAmCharts() {
    return new Promise((resolve, reject) => {
      am4core.ready(() => {
        try {
          //am4core.useTheme(am4themes_animated);

          if (this.chart) {
            this.chart.dispose();
          }

          this.chartElement.innerHTML = '';

          this.chart = am4core.create(this.chartElement, am4charts.XYChart);

          this.chart.defaultState.transitionDuration = 0;
          this.chart.hiddenState.transitionDuration = 0;

          this.chart.padding(20, 20, 20, 20);

          this.chart.plotContainer.background.fill = am4core.color("#fafafa");
          this.chart.plotContainer.background.fillOpacity = 0.1;

          const dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
          dateAxis.fontFamily = 'Helvetica';
          dateAxis.fontWeight = '600';
          dateAxis.fontSize = 11;
          dateAxis.renderer.minGridDistance = 70;
          dateAxis.renderer.labels.template.fill = am4core.color("#6b7280");
          dateAxis.renderer.grid.template.strokeDasharray = "3,3";
          dateAxis.renderer.grid.template.strokeOpacity = 0.3;
          dateAxis.renderer.grid.template.stroke = am4core.color("#e0e0e0");
          dateAxis.defaultState.transitionDuration = 0;
          dateAxis.hiddenState.transitionDuration = 0;

          const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
          valueAxis.renderer.labels.template.fill = am4core.color("#6b7280");
          valueAxis.fontFamily = 'Helvetica';
          valueAxis.fontWeight = '600';
          valueAxis.fontSize = 11;
          valueAxis.renderer.grid.template.strokeDasharray = "3,3";
          valueAxis.renderer.grid.template.strokeOpacity = 0.3;
          valueAxis.renderer.grid.template.stroke = am4core.color("#e0e0e0");
          valueAxis.renderer.grid.template.location = 0;
          valueAxis.defaultState.transitionDuration = 0;
          valueAxis.hiddenState.transitionDuration = 0;

          const series = this.chart.series.push(new am4charts.LineSeries());
          series.name = "Heart Rate";
          series.dataFields.valueY = "heartRate";
          series.dataFields.dateX = "timestamp";
          series.strokeWidth = 2;
          series.stroke = am4core.color("#cbcbcb");
          series.fill = am4core.color("transparent");
          series.fillOpacity = 0;

          series.defaultState.transitionDuration = 0;
          series.hiddenState.transitionDuration = 0;
          series.showOnInit = false;

          const bullet = series.bullets.push(new am4charts.CircleBullet());
          bullet.circle.strokeWidth = 1.5;
          bullet.circle.radius = 3;
          bullet.circle.fill = am4core.color("#ffffff");
          bullet.circle.stroke = am4core.color("#9ca3af");
          bullet.defaultState.transitionDuration = 0;
          bullet.hiddenState.transitionDuration = 0;

          series.tooltip.getFillFromObject = false;
          series.tooltip.background.fill = am4core.color("#ffffff");
          series.tooltip.background.stroke = am4core.color("#e5e7eb");
          series.tooltip.background.strokeWidth = 1;
          series.tooltipHTML = `
            <div style="
              background: white;
              color: #374151;
              font-family: Helvetica;
              font-size: 12px;
              font-weight: 500;
              padding: 8px 12px;
              border-radius: 4px;
              text-align: center;
              min-width: 120px;
            ">
              <div style="font-weight: bold; margin-bottom: 4px;">{valueY} BPM</div>
              <div style="color: #6b7280; font-size: 11px;">{dateX.formatDate('HH:mm:ss')}</div>
            </div>
          `;

          this.chart.cursor = new am4charts.XYCursor();
          this.chart.cursor.behavior = "panXY";
          this.chart.cursor.xAxis = dateAxis;
          this.chart.cursor.snapToSeries = [series];
          this.chart.cursor.maxTooltipDistance = 10;
          dateAxis.cursorTooltipEnabled = false;
          valueAxis.cursorTooltipEnabled = false;

          series.tooltip.pointerOrientation = "vertical";
          series.tooltip.animationDuration = 0;

          series.events.on("over", function(ev) {
            series.tooltip.disabled = false;
          });

          series.events.on("out", function(ev) {
            series.tooltip.disabled = false;
          });

          this.chart.events.on("ready", () => {
            resolve();
          });

        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Aggregate data by second, taking the average heart rate per second
  aggregateDataBySecond(data) {
    if (!data || data.length === 0) return [];

    const aggregatedData = new Map();

    data.forEach(item => {
      const timestamp = new Date(item.timestamp);
      // Round down to the nearest second
      const secondKey = new Date(timestamp.getFullYear(), timestamp.getMonth(), 
                                timestamp.getDate(), timestamp.getHours(), 
                                timestamp.getMinutes(), timestamp.getSeconds()).getTime();

      if (!aggregatedData.has(secondKey)) {
        aggregatedData.set(secondKey, {
          timestamp: new Date(secondKey),
          heartRates: [],
          sum: 0,
          count: 0
        });
      }

      const entry = aggregatedData.get(secondKey);
      entry.heartRates.push(item.heartRate);
      entry.sum += item.heartRate;
      entry.count += 1;
    });

    // Convert to array and calculate averages
    return Array.from(aggregatedData.values()).map(entry => ({
      timestamp: entry.timestamp,
      heartRate: Math.round(entry.sum / entry.count)
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  // Determine appropriate aggregation interval based on time range
  getAggregationInterval(timeinMins) {
    if (timeinMins <= 15) {
      return 1; // 1 second for short periods
    } else if (timeinMins <= 60) {
      return 5; // 5 seconds for 1 hour
    } else if (timeinMins <= 360) {
      return 30; // 30 seconds for 6 hours
    } else if (timeinMins <= 1440) {
      return 60; // 1 minute for 24 hours
    } else {
      return 300; // 5 minutes for 7 days or longer
    }
  }

  // Aggregate data by custom interval
  aggregateDataByInterval(data, intervalSeconds) {
    if (!data || data.length === 0) return [];

    const aggregatedData = new Map();
    const intervalMs = intervalSeconds * 1000;

    data.forEach(item => {
      const timestamp = new Date(item.timestamp);
      // Round down to the nearest interval
      const intervalKey = Math.floor(timestamp.getTime() / intervalMs) * intervalMs;

      if (!aggregatedData.has(intervalKey)) {
        aggregatedData.set(intervalKey, {
          timestamp: new Date(intervalKey),
          heartRates: [],
          sum: 0,
          count: 0
        });
      }

      const entry = aggregatedData.get(intervalKey);
      entry.heartRates.push(item.heartRate);
      entry.sum += item.heartRate;
      entry.count += 1;
    });

    // Convert to array and calculate averages
    return Array.from(aggregatedData.values()).map(entry => ({
      timestamp: entry.timestamp,
      heartRate: Math.round(entry.sum / entry.count)
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  updateData(data) {
    if (!this.isInitialized || !this.chart || !data) {
      return;
    }

    try {
      this.data = Array.isArray(data) ? data : [data];
      
      const chartData = this.data.slice(-50).map(item => ({
        timestamp: new Date(item.timestamp),
        heartRate: item.heartRate
      }));

      if (this.chart.series.length > 0) {
        this.chart.series.getIndex(0).data = chartData;

        if (chartData.length > 5) {
          const dateAxis = this.chart.xAxes.getIndex(0);
          if (dateAxis) {
            const startIndex = Math.max(0, chartData.length - 20);
            const startDate = chartData[startIndex].timestamp;
            const endDate = chartData[chartData.length - 1].timestamp;
            dateAxis.zoomToDates(startDate, endDate);
          }
        }
      }
    } catch (error) {
      console.error('Chart update error:', error);
    }
  }

  updateHistoricalData(data, isHistorical = true, timeRange = null) {
    if (!this.isInitialized || !data) {
      console.log('Chart not initialized or no data provided');
      return;
    }

    try {
      console.log(`📊 Processing ${data.length} historical data points for range: ${timeRange}`);
      
      this.data = Array.isArray(data) ? data : [data];
      
      // Determine aggregation interval based on time range
      const timeinMins = timeRange ? this.getTimeRangeInMinutes(timeRange) : 60;
      const aggregationInterval = this.getAggregationInterval(timeinMins);
      
      console.log(`📊 Using ${aggregationInterval}s aggregation interval for ${timeinMins}min range`);
      
      // Aggregate data appropriately
      let chartData;
      if (aggregationInterval === 1) {
        chartData = this.aggregateDataBySecond(this.data);
      } else {
        chartData = this.aggregateDataByInterval(this.data, aggregationInterval);
      }

      console.log(`📊 Aggregated to ${chartData.length} data points`);

      if (this.chart.series.length > 0) {
        // Clear existing data and set new data
        const series = this.chart.series.getIndex(0);
        series.data = chartData;

        // Set appropriate zoom for historical data
        if (chartData.length > 0) {
          const dateAxis = this.chart.xAxes.getIndex(0);
          if (dateAxis) {
            const startDate = chartData[0].timestamp;
            const endDate = chartData[chartData.length - 1].timestamp;
            
            console.log(`📊 Setting chart range from ${startDate.toISOString()} to ${endDate.toISOString()}`);
            
            // Use setTimeout to ensure the chart has processed the new data
            setTimeout(() => {
              dateAxis.zoomToDates(startDate, endDate, false, true);
            }, 100);
          }
        }

        // Force chart refresh
        this.chart.invalidateData();
      }

    } catch (error) {
      console.error('Historical chart update error:', error);
    }
  }

  // Helper function to convert time range string to minutes
  getTimeRangeInMinutes(timeRange) {
    const timeRangeMap = {
      '5min': 5,
      '15min': 15,
      '1hour': 60,
      '6hours': 360,
      '24hours': 1440,
      '7days': 10080
    };
    return timeRangeMap[timeRange] || 60;
  }

  updateStatus(status) {
    if (this.chartStatus) {
      this.chartStatus.textContent = status;
    }
  }

  showOverlay() {
    if (this.chartOverlay) {
      this.chartOverlay.style.display = 'flex';
    }
  }

  hideOverlay() {
    if (this.chartOverlay) {
      this.chartOverlay.style.display = 'none';
    }
  }

  showError(message) {
    if (this.chartOverlay) {
      this.chartOverlay.innerHTML = `
        <div class="chart-overlay-content">
          <div class="error-icon">⚠️</div>
          <p>Chart Error: ${message}</p>
          <button onclick="location.reload()" class="btn btn-primary">Reload</button>
        </div>
      `;
      this.chartOverlay.style.display = 'flex';
    }
  }

  clear() {
    this.data = [];
    if (this.chart && this.chart.series.length > 0) {
      this.chart.series.getIndex(0).data = [];
    }
  }

  dispose() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
      this.isInitialized = false;
    }
  }
}

window.ChartManager = ChartManager;