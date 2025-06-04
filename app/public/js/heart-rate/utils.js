const Utils = {
  formatTime: function(date) {
    return new Date(date).toLocaleTimeString();
  },

  formatDateTime: function(date) {
    return new Date(date).toLocaleString();
  },

  formatNumber: function(num) {
    return Number(num).toFixed(0);
  },

  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  createElement: function(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  },

  updateElement: function(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  },

  showElement: function(id) {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'block';
    }
  },

  hideElement: function(id) {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    }
  },

  addClass: function(id, className) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add(className);
    }
  },

  removeClass: function(id, className) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove(className);
    }
  },

  getTimeRange: function(minutes) {
    const end = new Date();
    const start = new Date(end.getTime() - (minutes * 60 * 1000));
    return { start, end };
  },

  calculateStats: function(data) {
    if (!data || data.length === 0) {
      return { min: 0, max: 0, average: 0, count: 0 };
    }

    const heartRates = data.map(d => d.heartRate);
    const min = Math.min(...heartRates);
    const max = Math.max(...heartRates);
    const average = Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length);
    
    return { min, max, average, count: data.length };
  },

  isValidHeartRate: function(rate) {
    return rate && rate > 0 && rate < 300;
  },

  showNotification: function(message, type = 'info') {
    const notification = Utils.createElement('div', `notification notification-${type}`, message);
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
};

window.Utils = Utils;