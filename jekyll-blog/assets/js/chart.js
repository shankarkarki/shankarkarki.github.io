/**
 * Chart Management System for Jekyll Energy Blog
 * Handles all Chart.js visualizations for energy market analysis
 * 
 * File: jekyll-blog/assets/js/charts.js
 */

class EnergyChartsManager {
  constructor() {
    this.charts = new Map();
    this.defaultColors = {
      primary: '#2980b9',
      secondary: '#e74c3c', 
      success: '#27ae60',
      warning: '#f39c12',
      info: '#3498db',
      dark: '#34495e',
      light: '#ecf0f1'
    };
    
    // Chart configurations
    this.chartConfigs = this.initializeChartConfigs();
    
    console.log('EnergyChartsManager initialized');
  }

  initializeChartConfigs() {
    return {
      'merit-order': this.getMeritOrderConfig(),
      'sensitivity': this.getSensitivityConfig(),
      'lmp-heatmap': this.getLMPHeatmapConfig(),
      'duck-curve': this.getDuckCurveConfig(),
      'constraint-frequency': this.getConstraintFrequencyConfig(),
      'trading-spread': this.getTradingSpreadConfig()
    };
  }

  /**
   * Initialize a chart from a canvas element
   */
  initializeChart(canvas) {
    const chartType = canvas.dataset.chart;
    const options = canvas.dataset.options ? JSON.parse(canvas.dataset.options) : {};
    
    if (!this.chartConfigs[chartType]) {
      console.warn(`Chart type '${chartType}' not found`);
      return null;
    }
    
    // Merge default config with custom options
    const config = this.mergeConfigs(this.chartConfigs[chartType], options);
    
    try {
      const chart = new Chart(canvas, config);
      const chartId = canvas.id || `${chartType}-${Date.now()}`;
      this.charts.set(chartId, chart);
      
      console.log(`Chart '${chartType}' initialized successfully with ID: ${chartId}`);
      return chart;
    } catch (error) {
      console.error(`Error initializing chart '${chartType}':`, error);
      return null;
    }
  }

  /**
   * Merit Order Curve Configuration
   */
  getMeritOrderConfig() {
    return {
      type: 'line',
      data: {
        labels: [0, 100, 250, 300],
        datasets: [{
          label: 'Merit Order Curve',
          data: [25, 25, 45, 150],
          borderColor: this.defaultColors.primary,
          backgroundColor: this.hexToRgba(this.defaultColors.primary, 0.1),
          fill: true,
          stepped: 'after',
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6
        }, {
          label: 'Current Demand (200 MW)',
          data: [null, null, 45, null],
          borderColor: this.defaultColors.secondary,
          backgroundColor: this.defaultColors.secondary,
          borderWidth: 0,
          pointRadius: 12,
          pointHoverRadius: 15,
          showLine: false,
          pointStyle: 'circle'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Merit Order Curve and Shadow Price Formation',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: this.defaultColors.primary,
            borderWidth: 1
          }
        },
        scales: {
          x: {
            title: { 
              display: true, 
              text: 'Cumulative Capacity (MW)',
              font: { weight: 'bold' }
            },
            grid: { color: 'rgba(0,0,0,0.1)' }
          },
          y: {
            title: { 
              display: true, 
              text: 'Marginal Cost ($/MWh)',
              font: { weight: 'bold' }
            },
            grid: { color: 'rgba(0,0,0,0.1)' },
            beginAtZero: true
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    };
  }

  /**
   * Sensitivity Analysis Configuration
   */
  getSensitivityConfig() {
    return {
      type: 'line',
      data: {
        labels: [150, 170, 190, 210, 230, 250, 270, 290],
        datasets: [{
          label: 'System Lambda (λ)',
          data: [25, 25, 45, 45, 150, 150, 400, 1200],
          borderColor: this.defaultColors.info,
          backgroundColor: this.hexToRgba(this.defaultColors.info, 0.1),
          tension: 0.2,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 8
        }, {
          label: 'Congestion Cost (ν)',
          data: [0, 0, 0, 25, 75, 125, 200, 350],
          borderColor: this.defaultColors.secondary,
          backgroundColor: this.hexToRgba(this.defaultColors.secondary, 0.1),
          tension: 0.2,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 8
        }, {
          label: 'Total LMP',
          data: [25, 25, 45, 70, 225, 275, 600, 1550],
          borderColor: this.defaultColors.success,
          backgroundColor: this.hexToRgba(this.defaultColors.success, 0.1),
          tension: 0.2,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Shadow Price Sensitivity to System Stress',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20 }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.8)',
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: $${context.parsed.y}/MWh`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { 
              display: true, 
              text: 'System Demand (MW)',
              font: { weight: 'bold' }
            }
          },
          y: {
            title: { 
              display: true, 
              text: 'Price ($/MWh)',
              font: { weight: 'bold' }
            },
            type: 'logarithmic',
            beginAtZero: false,
            min: 1
          }
        }
      }
    };
  }

  /**
   * LMP Heatmap Configuration (as bar chart)
   */
  getLMPHeatmapConfig() {
    return {
      type: 'bar',
      data: {
        labels: ['North Hub', 'South Hub', 'West Hub', 'Houston Hub'],
        datasets: [{
          label: 'Normal Conditions',
          data: [45, 47, 52, 48],
          backgroundColor: this.hexToRgba(this.defaultColors.info, 0.8),
          borderColor: this.defaultColors.info,
          borderWidth: 2
        }, {
          label: 'Constrained Conditions',
          data: [150, 275, 320, 180],
          backgroundColor: this.hexToRgba(this.defaultColors.secondary, 0.8),
          borderColor: this.defaultColors.secondary,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Locational Marginal Prices Across Market Regions',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20 }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: $${context.parsed.y}/MWh`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { 
              display: true, 
              text: 'Market Regions',
              font: { weight: 'bold' }
            }
          },
          y: {
            title: { 
              display: true, 
              text: 'LMP ($/MWh)',
              font: { weight: 'bold' }
            },
            beginAtZero: true
          }
        }
      }
    };
  }

  /**
   * Duck Curve Configuration
   */
  getDuckCurveConfig() {
    return {
      type: 'line',
      data: {
        labels: Array.from({length: 24}, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Total Demand',
          data: [160, 150, 145, 140, 145, 160, 180, 200, 210, 215, 220, 225, 230, 235, 240, 245, 250, 260, 270, 265, 250, 220, 190, 170],
          borderColor: this.defaultColors.dark,
          backgroundColor: this.hexToRgba(this.defaultColors.dark, 0.1),
          yAxisID: 'y',
          tension: 0.3,
          borderWidth: 3,
          pointRadius: 3,
          fill: true
        }, {
          label: 'Net Demand (after Solar)',
          data: [160, 150, 145, 140, 145, 160, 180, 200, 190, 170, 150, 140, 130, 135, 140, 165, 200, 240, 270, 265, 250, 220, 190, 170],
          borderColor: this.defaultColors.warning,
          backgroundColor: this.hexToRgba(this.defaultColors.warning, 0.1),
          yAxisID: 'y',
          tension: 0.3,
          borderWidth: 3,
          pointRadius: 3,
          fill: true
        }, {
          label: 'Shadow Price',
          data: [25, 25, 25, 25, 25, 25, 45, 45, 25, 25, 25, 25, 25, 25, 25, 45, 150, 350, 400, 300, 150, 45, 45, 25],
          borderColor: this.defaultColors.secondary,
          backgroundColor: this.hexToRgba(this.defaultColors.secondary, 0.2),
          yAxisID: 'y1',
          tension: 0.3,
          borderWidth: 4,
          pointRadius: 4,
          borderDash: [5, 5]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Duck Curve and Shadow Price Patterns',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20 }
          }
        },
        scales: {
          x: {
            title: { 
              display: true, 
              text: 'Hour of Day',
              font: { weight: 'bold' }
            }
          },
          y: {
            title: { 
              display: true, 
              text: 'Demand (MW)',
              font: { weight: 'bold' }
            },
            position: 'left',
            beginAtZero: true
          },
          y1: {
            title: { 
              display: true, 
              text: 'Shadow Price ($/MWh)',
              font: { weight: 'bold' }
            },
            position: 'right',
            beginAtZero: true,
            grid: { drawOnChartArea: false }
          }
        }
      }
    };
  }

  /**
   * Constraint Frequency Configuration
   */
  getConstraintFrequencyConfig() {
    return {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Transmission Constraints (Hours)',
          data: [50, 30, 20, 25, 40, 120, 200, 250, 180, 60, 35, 45],
          backgroundColor: this.hexToRgba(this.defaultColors.info, 0.8),
          borderColor: this.defaultColors.info,
          borderWidth: 2
        }, {
          label: 'Generation Constraints (Hours)',
          data: [80, 60, 40, 30, 60, 150, 300, 350, 200, 80, 70, 85],
          backgroundColor: this.hexToRgba(this.defaultColors.secondary, 0.8),
          borderColor: this.defaultColors.secondary,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Constraint Binding Frequency',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20 }
          }
        },
        scales: {
          x: {
            title: { 
              display: true, 
              text: 'Month',
              font: { weight: 'bold' }
            }
          },
          y: {
            title: { 
              display: true, 
              text: 'Hours per Month',
              font: { weight: 'bold' }
            },
            beginAtZero: true
          }
        }
      }
    };
  }

  /**
   * Trading Spread Configuration
   */
  getTradingSpreadConfig() {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Arbitrage Opportunities',
          data: [
            {x: 25, y: 5}, {x: 50, y: 15}, {x: 75, y: 25}, {x: 100, y: 40},
            {x: 150, y: 75}, {x: 200, y: 120}, {x: 300, y: 200}, {x: 500, y: 350}
          ],
          backgroundColor: this.hexToRgba(this.defaultColors.success, 0.7),
          borderColor: this.defaultColors.success,
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Trading Spread Opportunities vs Price Levels',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20 }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            callbacks: {
              label: function(context) {
                return `Avg LMP: $${context.parsed.x}/MWh, Max Spread: $${context.parsed.y}/MWh`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { 
              display: true, 
              text: 'Average LMP ($/MWh)',
              font: { weight: 'bold' }
            },
            beginAtZero: true
          },
          y: {
            title: { 
              display: true, 
              text: 'Maximum Spread ($/MWh)',
              font: { weight: 'bold' }
            },
            beginAtZero: true
          }
        }
      }
    };
  }

  /**
   * Utility Methods
   */
  mergeConfigs(defaultConfig, customOptions) {
    return {
      ...defaultConfig,
      ...customOptions,
      data: {
        ...defaultConfig.data,
        ...(customOptions.data || {})
      },
      options: {
        ...defaultConfig.options,
        ...(customOptions.options || {})
      }
    };
  }

  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Public API Methods
   */
  updateChart(chartId, newData) {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.data = { ...chart.data, ...newData };
      chart.update('active');
      return true;
    }
    return false;
  }

  destroyChart(chartId) {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.destroy();
      this.charts.delete(chartId);
      return true;
    }
    return false;
  }

  getChart(chartId) {
    return this.charts.get(chartId);
  }

  getAllCharts() {
    return Array.from(this.charts.values());
  }

  resizeCharts() {
    this.charts.forEach(chart => {
      chart.resize();
    });
  }
}

// Auto-initialization for Jekyll
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing charts...');
  
  // Create global chart manager instance
  window.EnergyCharts = new EnergyChartsManager();
  
  // Find all chart canvas elements and initialize them
  const chartCanvases = document.querySelectorAll('canvas[data-chart]');
  
  chartCanvases.forEach((canvas, index) => {
    // Ensure canvas has an ID for chart management
    if (!canvas.id) {
      canvas.id = `chart-${canvas.dataset.chart}-${index}`;
    }
    
    // Set default height if not specified
    if (!canvas.style.height && !canvas.height) {
      canvas.style.height = '400px';
    }
    
    // Initialize the chart
    window.EnergyCharts.initializeChart(canvas);
  });
  
  console.log(`Initialized ${chartCanvases.length} chart(s)`);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    window.EnergyCharts.resizeCharts();
  });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnergyChartsManager;
}