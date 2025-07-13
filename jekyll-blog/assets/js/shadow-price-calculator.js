/**
 * Shadow Price Calculator for Jekyll Energy Blog
 * Modular JavaScript component for electricity market analysis
 * 
 * File: jekyll-blog/assets/js/shadow-price-calculator.js
 */

class ShadowPriceCalculator {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      // Slider configurations
      sliders: {
        demand: { 
          min: 150, max: 300, initial: 200, step: 5, 
          unit: 'MW', label: 'System Demand' 
        },
        transmission: { 
          min: 80, max: 200, initial: 120, step: 10, 
          unit: 'MW', label: 'Transmission Capacity' 
        },
        availability: { 
          min: 60, max: 100, initial: 100, step: 5, 
          unit: '%', label: 'Generator Availability' 
        },
        time: { 
          min: 0, max: 23, initial: 18, step: 1, 
          unit: ':00', label: 'Time of Day (Hour)' 
        },
        weather: { 
          min: 1, max: 5, initial: 1, step: 1, 
          unit: '', label: 'Weather Stress Level' 
        }
      },
      
      // Weather condition labels
      weatherLabels: ['Normal', 'Mild Stress', 'Moderate Stress', 'High Stress', 'Extreme'],
      
      // Generator parameters (from your original model)
      generators: {
        coal: { capacity: 100, marginalCost: 25 },
        gas: { capacity: 150, marginalCost: 45 },
        peaker: { capacity: 50, marginalCost: 150 }
      },
      
      // Merge with any custom options
      ...options
    };
    
    // State tracking
    this.currentValues = {};
    this.currentResults = {};
    
    // Initialize the component
    this.init();
  }

  init() {
    console.log('Initializing Shadow Price Calculator...');
    this.createHTML();
    this.bindEvents();
    this.updateCalculations();
    console.log('Shadow Price Calculator initialized successfully!');
  }

  createHTML() {
    this.container.innerHTML = `
      <div class="shadow-price-dashboard">
        <div class="controls-section">
          <h4>Market Parameters</h4>
          <div class="controls-grid">
            ${this.createAllSliders()}
          </div>
        </div>

        <div class="results-section">
          <h4>Shadow Price Results</h4>
          <div class="results-grid">
            ${this.createResultCards()}
          </div>
        </div>

        <div class="insights-section">
          <h4>Market Insights</h4>
          <div class="insights-content" id="insights-${this.getInstanceId()}">
            <p>Adjust the parameters above to see real-time market analysis...</p>
          </div>
        </div>
      </div>
    `;
  }

  createAllSliders() {
    return Object.keys(this.options.sliders)
      .map(key => this.createSliderHTML(key))
      .join('');
  }

  createSliderHTML(key) {
    const config = this.options.sliders[key];
    const instanceId = this.getInstanceId();
    
    return `
      <div class="slider-container">
        <label for="${key}Slider-${instanceId}">${config.label}</label>
        <input type="range" 
               id="${key}Slider-${instanceId}" 
               class="slider-input"
               min="${config.min}" 
               max="${config.max}" 
               value="${config.initial}" 
               step="${config.step}"
               data-slider="${key}">
        <div class="slider-value">
          <span class="value-display" id="${key}Value-${instanceId}">${config.initial}</span>
          <span class="value-unit">${config.unit}</span>
        </div>
      </div>
    `;
  }

  createResultCards() {
    const instanceId = this.getInstanceId();
    const cards = [
      { id: 'systemLambda', title: 'System Lambda', unit: '$/MWh', initial: '45' },
      { id: 'congestionCost', title: 'Congestion Cost', unit: '$/MWh', initial: '0' },
      { id: 'lmpRegion1', title: 'LMP Region 1', unit: '$/MWh', initial: '45' },
      { id: 'lmpRegion2', title: 'LMP Region 2', unit: '$/MWh', initial: '45' },
      { id: 'priceSpread', title: 'Price Spread', unit: '$/MWh', initial: '0' },
      { id: 'totalCost', title: 'Total Cost', unit: '/hr', initial: '9,000' }
    ];

    return cards.map(card => `
      <div class="result-card">
        <h5>${card.title}</h5>
        <div class="result-value">
          ${card.unit.startsWith('$') ? '$' : ''}
          <span id="${card.id}-${instanceId}" class="result-number">${card.initial}</span>
          ${card.unit}
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    // Bind all slider events
    this.container.querySelectorAll('.slider-input').forEach(slider => {
      slider.addEventListener('input', () => {
        this.updateCalculations();
      });
    });

    console.log('Event listeners bound successfully');
  }

  updateCalculations() {
    // Get current values from sliders
    this.currentValues = this.getCurrentValues();
    
    // Calculate shadow prices using market model
    this.currentResults = this.calculateShadowPrices(this.currentValues);
    
    // Update display
    this.updateDisplay(this.currentValues, this.currentResults);
    
    // Update insights
    this.updateInsights(this.currentValues, this.currentResults);
    
    // Log for debugging (you can remove this later)
    console.log('Calculation updated:', this.currentResults);
  }

  getCurrentValues() {
    const instanceId = this.getInstanceId();
    const values = {};
    
    Object.keys(this.options.sliders).forEach(key => {
      const slider = this.container.querySelector(`#${key}Slider-${instanceId}`);
      if (slider) {
        values[key] = parseFloat(slider.value);
      }
    });
    
    return values;
  }

  calculateShadowPrices(values) {
    const { demand, transmission, availability, time: hour, weather } = values;
    const { generators } = this.options;
    
    // Convert availability from percentage to fraction
    const availabilityFraction = availability / 100;
    
    // Calculate effective generator capacities
    const effectiveCapacities = {
      coal: generators.coal.capacity * availabilityFraction,
      gas: generators.gas.capacity * availabilityFraction,
      peaker: generators.peaker.capacity * availabilityFraction
    };
    
    // Time-of-day demand multiplier
    let demandMultiplier = 1.0;
    if (hour >= 17 && hour <= 20) {
      demandMultiplier = 1.2; // Evening peak
    } else if (hour >= 11 && hour <= 15) {
      demandMultiplier = 0.9; // Solar hours (reduced net demand)
    }
    
    // Weather stress effect on demand and generation efficiency
    const weatherMultiplier = 0.4 + (weather - 1) * 0.3;
    const adjustedDemand = demand * demandMultiplier * weatherMultiplier;
    
    // Economic dispatch logic
    let systemLambda = generators.coal.marginalCost;
    let congestionCost = 0;
    let generationMix = { coal: 0, gas: 0, peaker: 0 };
    
    // Dispatch coal first (cheapest)
    if (adjustedDemand <= effectiveCapacities.coal) {
      generationMix.coal = adjustedDemand;
      systemLambda = generators.coal.marginalCost;
    } else {
      generationMix.coal = effectiveCapacities.coal;
      const remainingDemand = adjustedDemand - effectiveCapacities.coal;
      
      // Check transmission constraint for gas dispatch
      const gasAvailable = Math.min(effectiveCapacities.gas, transmission - effectiveCapacities.coal);
      
      if (remainingDemand <= gasAvailable) {
        generationMix.gas = remainingDemand;
        systemLambda = generators.gas.marginalCost;
      } else {
        generationMix.gas = gasAvailable;
        systemLambda = generators.peaker.marginalCost;
        
        // Transmission constraint is binding - calculate congestion cost
        if (effectiveCapacities.gas > gasAvailable) {
          const congestionSeverity = (remainingDemand - gasAvailable) / gasAvailable;
          congestionCost = Math.min(125, congestionSeverity * 50);
        }
        
        // Dispatch expensive peakers for remaining demand
        const peakerNeeded = remainingDemand - gasAvailable;
        generationMix.peaker = Math.min(peakerNeeded, effectiveCapacities.peaker);
        
        // If peaker capacity is also insufficient, prices spike further
        if (peakerNeeded > effectiveCapacities.peaker) {
          const scarcityMultiplier = 1 + (peakerNeeded - effectiveCapacities.peaker) / effectiveCapacities.peaker;
          systemLambda *= scarcityMultiplier;
        }
      }
    }
    
    // Weather stress impact on prices
    if (weather >= 4) {
      const weatherStressMultiplier = 1 + (weather - 3) * 1.5;
      systemLambda *= weatherStressMultiplier;
      congestionCost *= weatherStressMultiplier;
    }
    
    // Generator availability impact
    if (availability < 90) {
      const availabilityStressMultiplier = 1 + (90 - availability) / 30;
      systemLambda *= availabilityStressMultiplier;
    }
    
    // Calculate regional LMPs
    const lmpRegion1 = systemLambda;
    const lmpRegion2 = systemLambda + congestionCost;
    const priceSpread = congestionCost;
    const totalCost = adjustedDemand * systemLambda;
    
    return {
      systemLambda: Math.round(systemLambda),
      congestionCost: Math.round(congestionCost),
      lmpRegion1: Math.round(lmpRegion1),
      lmpRegion2: Math.round(lmpRegion2),
      priceSpread: Math.round(priceSpread),
      totalCost: Math.round(totalCost),
      adjustedDemand: Math.round(adjustedDemand),
      generationMix: generationMix,
      effectiveCapacities: effectiveCapacities
    };
  }

  updateDisplay(values, results) {
    const instanceId = this.getInstanceId();
    
    // Update slider value displays
    Object.keys(values).forEach(key => {
      const valueElement = this.container.querySelector(`#${key}Value-${instanceId}`);
      if (valueElement) {
        let displayValue = values[key];
        
        // Special formatting for specific sliders
        if (key === 'availability') {
          displayValue = Math.round(displayValue);
        } else if (key === 'weather') {
          displayValue = this.options.weatherLabels[displayValue - 1];
        } else if (key === 'time') {
          displayValue = `${displayValue}:00`;
        }
        
        valueElement.textContent = displayValue;
      }
    });
    
    // Update result displays
    Object.keys(results).forEach(key => {
      const element = this.container.querySelector(`#${key}-${instanceId}`);
      if (element) {
        let value = results[key];
        
        // Format large numbers with commas
        if (key === 'totalCost') {
          value = value.toLocaleString();
        }
        
        element.textContent = value;
      }
    });
  }

  updateInsights(values, results) {
    const instanceId = this.getInstanceId();
    const insightsElement = this.container.querySelector(`#insights-${instanceId}`);
    
    if (!insightsElement) return;
    
    const insights = [];
    
    // Market condition analysis
    if (results.systemLambda > 500) {
      insights.push(`
        <div class="insight severe">
          🚨 <strong>Extreme Price Conditions</strong><br>
          System lambda at $${results.systemLambda}/MWh indicates severe market stress. 
          Emergency reserves may be needed.
        </div>
      `);
    } else if (results.systemLambda > 150) {
      insights.push(`
        <div class="insight warning">
          ⚠️ <strong>High Price Alert</strong><br>
          Expensive peaker units ($${this.options.generators.peaker.marginalCost}/MWh) are setting market price. 
          System approaching capacity limits.
        </div>
      `);
    } else if (results.systemLambda <= 45) {
      insights.push(`
        <div class="insight normal">
          ✅ <strong>Normal Operations</strong><br>
          System operating efficiently with ${results.systemLambda <= 25 ? 'coal baseload' : 'gas generation'} 
          setting prices.
        </div>
      `);
    }
    
    // Congestion analysis
    if (results.congestionCost > 100) {
      insights.push(`
        <div class="insight congestion">
          🔌 <strong>Severe Transmission Congestion</strong><br>
          $${results.congestionCost}/MWh price spread creates significant arbitrage opportunities. 
          Consider transmission investments.
        </div>
      `);
    } else if (results.congestionCost > 25) {
      insights.push(`
        <div class="insight congestion-mild">
          📈 <strong>Moderate Congestion</strong><br>
          Some transmission constraints binding. Energy storage could capture value.
        </div>
      `);
    }
    
    // Weather impact
    if (values.weather >= 4) {
      insights.push(`
        <div class="insight weather">
          🌡️ <strong>Weather Stress Impact</strong><br>
          ${this.options.weatherLabels[values.weather - 1]} conditions reducing generation efficiency 
          and increasing cooling demand.
        </div>
      `);
    }
    
    // Investment opportunities
    if (results.congestionCost > 50) {
      insights.push(`
        <div class="insight investment">
          💡 <strong>Investment Opportunity</strong><br>
          High congestion costs ($${results.congestionCost}/MWh) suggest transmission expansion 
          would provide significant economic value.
        </div>
      `);
    }
    
    if (results.systemLambda > 200 && values.availability < 90) {
      insights.push(`
        <div class="insight capacity">
          ⚡ <strong>Capacity Shortage Signal</strong><br>
          High prices with ${values.availability}% availability suggest additional generation 
          capacity would be valuable.
        </div>
      `);
    }
    
    // Time-specific insights
    if (values.time >= 17 && values.time <= 20 && results.systemLambda > 100) {
      insights.push(`
        <div class="insight time">
          🕐 <strong>Evening Peak Challenge</strong><br>
          High prices during evening peak (${values.time}:00) suggest need for flexible resources 
          or demand response programs.
        </div>
      `);
    }
    
    // Default message if no specific insights
    if (insights.length === 0) {
      insights.push(`
        <div class="insight normal">
          📊 <strong>Market Analysis</strong><br>
          System operating under normal conditions. Adjust parameters above to explore 
          different market scenarios.
        </div>
      `);
    }
    
    insightsElement.innerHTML = insights.join('');
  }

  // Utility methods
  getInstanceId() {
    if (!this._instanceId) {
      this._instanceId = 'calc-' + Math.random().toString(36).substr(2, 9);
    }
    return this._instanceId;
  }

  // Public API methods for external access
  setValues(newValues) {
    const instanceId = this.getInstanceId();
    Object.keys(newValues).forEach(key => {
      const slider = this.container.querySelector(`#${key}Slider-${instanceId}`);
      if (slider && this.options.sliders[key]) {
        slider.value = newValues[key];
      }
    });
    this.updateCalculations();
  }

  getResults() {
    return { ...this.currentResults };
  }

  getValues() {
    return { ...this.currentValues };
  }

  exportData() {
    return {
      timestamp: new Date().toISOString(),
      inputs: this.getValues(),
      outputs: this.getResults(),
      config: this.options
    };
  }
}

// Auto-initialization for Jekyll
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, looking for shadow price calculators...');
  
  // Find all calculator containers and initialize them
  const calculatorContainers = document.querySelectorAll('[data-component="shadow-price-calculator"]');
  
  calculatorContainers.forEach((container, index) => {
    console.log(`Initializing calculator ${index + 1}...`);
    
    // Check for custom configuration
    let config = {};
    if (container.dataset.config) {
      try {
        config = JSON.parse(container.dataset.config);
      } catch (e) {
        console.warn('Invalid config JSON, using defaults:', e);
      }
    }
    
    // Create calculator instance
    const calculator = new ShadowPriceCalculator(container, config);
    
    // Store reference for external access
    container._calculatorInstance = calculator;
  });
  
  console.log(`Initialized ${calculatorContainers.length} shadow price calculator(s)`);
});

// Global access for debugging and external control
window.ShadowPriceCalculator = ShadowPriceCalculator;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShadowPriceCalculator;
}