/**
 * Price Receiver Module
 * Receives signals from connected websites via hydrogen bonds
 */

class PriceReceiver {
  constructor(wiringConfig) {
    this.config = wiringConfig.wiring_configuration;
    this.signalHandlers = new Map();
    this.receivedSignals = [];
    this.setupHandlers();
  }

  /**
   * Setup signal handlers based on configuration
   */
  setupHandlers() {
    this.config.receives_signals.forEach(signal => {
      this.signalHandlers.set(`${signal.source}:${signal.event}`, signal.handler);
    });
  }

  /**
   * Receive a signal from another website
   */
  receiveSignal(signal) {
    const { source, event, data, timestamp = Date.now() } = signal;
    
    const handlerKey = `${source}:${event}`;
    const handlerName = this.signalHandlers.get(handlerKey);

    if (!handlerName) {
      return {
        received: false,
        error: `No handler for ${source}:${event}`,
        available_handlers: Array.from(this.signalHandlers.keys())
      };
    }

    // Record the signal
    this.receivedSignals.push({
      source,
      event,
      data,
      timestamp,
      handler: handlerName
    });

    // Keep only last 100 signals
    if (this.receivedSignals.length > 100) {
      this.receivedSignals.shift();
    }

    return {
      received: true,
      source,
      event,
      handler: handlerName,
      timestamp,
      status: 'signal_received_via_hydrogen_bond'
    };
  }

  /**
   * Handle commerce purchase signal
   */
  updatePriceOnPurchase(purchaseData) {
    const { item, quantity, price, user } = purchaseData;

    return {
      handler: 'updatePriceOnPurchase',
      action: 'discharge_capacitor',
      purchase_item: item,
      quantity,
      price_paid: price,
      market_impact: 'supply_decreased',
      next_action: 'adjust_prices_upward_slightly'
    };
  }

  /**
   * Handle banksy art creation signal
   */
  calculateArtPrice(artData) {
    const { complexity, timeSpent, style } = artData;

    return {
      handler: 'calculateArtPrice',
      action: 'calculate_dynamic_price',
      art_complexity: complexity,
      time_spent: timeSpent,
      style,
      pricing_basis: 'complexity_time_demand',
      price_calculated: true
    };
  }

  /**
   * Handle token mint signal
   */
  mintTokenPrice(tokenData) {
    const { tokenId, type, utility, supply } = tokenData;

    return {
      handler: 'mintTokenPrice',
      action: 'set_token_value',
      token_id: tokenId,
      token_type: type,
      utility_level: utility,
      supply,
      pricing_basis: 'andy_lian_coin_market_price'
    };
  }

  /**
   * Handle dash-hub economy status signal
   */
  adjustMarketForces(economyData) {
    const { supply, demand, activity, trend } = economyData;

    return {
      handler: 'adjustMarketForces',
      action: 'adjust_market_dynamics',
      supply_level: supply,
      demand_level: demand,
      activity_level: activity,
      market_trend: trend,
      adjustments: ['supply', 'demand', 'activity', 'mongoose_learning']
    };
  }

  /**
   * Process a signal with its appropriate handler
   */
  processSignal(signal) {
    const received = this.receiveSignal(signal);
    
    if (!received.received) {
      return received;
    }

    // Execute the handler
    let result;
    switch (received.handler) {
      case 'updatePriceOnPurchase':
        result = this.updatePriceOnPurchase(signal.data);
        break;
      case 'calculateArtPrice':
        result = this.calculateArtPrice(signal.data);
        break;
      case 'mintTokenPrice':
        result = this.mintTokenPrice(signal.data);
        break;
      case 'adjustMarketForces':
        result = this.adjustMarketForces(signal.data);
        break;
      default:
        result = { error: 'Handler not implemented' };
    }

    return {
      signal_received: received,
      handler_result: result,
      hydrogen_bond: 'active',
      propagation: 'instant'
    };
  }

  /**
   * Get recent signals for monitoring
   */
  getRecentSignals(limit = 10) {
    return {
      signals: this.receivedSignals.slice(-limit),
      total_received: this.receivedSignals.length,
      active_handlers: Array.from(this.signalHandlers.keys())
    };
  }

  /**
   * Get wiring status
   */
  getWiringStatus() {
    const sources = new Set(this.receivedSignals.map(s => s.source));
    
    return {
      connected_sources: Array.from(sources),
      active_handlers: this.signalHandlers.size,
      signals_processed: this.receivedSignals.length,
      hydrogen_bonds: this.config.hydrogen_bonds.enabled ? 'active' : 'inactive',
      propagation_speed: this.config.hydrogen_bonds.propagation_speed,
      status: 'receiving_signals'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceReceiver;
}
