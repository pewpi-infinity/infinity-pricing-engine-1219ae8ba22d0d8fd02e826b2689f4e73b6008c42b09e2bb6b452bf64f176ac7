/**
 * Price Broadcaster Module
 * Sends price updates to connected websites via hydrogen bonds
 */

class PriceBroadcaster {
  constructor(wiringConfig) {
    this.config = wiringConfig.wiring_configuration;
    this.broadcastTargets = new Map();
    this.sentUpdates = [];
    this.setupTargets();
  }

  /**
   * Setup broadcast targets based on configuration
   */
  setupTargets() {
    this.config.sends_updates.forEach(target => {
      this.broadcastTargets.set(target.target, {
        signal: target.signal,
        frequency: target.frequency,
        lastSent: null
      });
    });
  }

  /**
   * Broadcast price update to a specific target
   */
  broadcastUpdate(target, updateData) {
    const targetConfig = this.broadcastTargets.get(target);
    
    if (!targetConfig) {
      return {
        sent: false,
        error: `Unknown target: ${target}`,
        available_targets: Array.from(this.broadcastTargets.keys())
      };
    }

    const update = {
      target,
      signal: targetConfig.signal,
      data: updateData,
      timestamp: Date.now(),
      frequency: targetConfig.frequency
    };

    // Record the update
    this.sentUpdates.push(update);
    if (this.sentUpdates.length > 100) {
      this.sentUpdates.shift();
    }

    // Update last sent timestamp
    targetConfig.lastSent = update.timestamp;

    return {
      sent: true,
      target,
      signal: targetConfig.signal,
      timestamp: update.timestamp,
      delivery: 'via_hydrogen_bond',
      propagation: 'instant'
    };
  }

  /**
   * Broadcast to commerce (updated prices)
   */
  broadcastToCommerce(priceData) {
    return this.broadcastUpdate('commerce', {
      type: 'updated_prices',
      prices: priceData,
      alc_market_value: priceData.alc_value,
      effective_immediately: true
    });
  }

  /**
   * Broadcast to dash-hub (market data)
   */
  broadcastToDashHub(marketData) {
    return this.broadcastUpdate('dash-hub', {
      type: 'market_data',
      alc_value: marketData.current_value,
      volume: marketData.daily_volume,
      trend: marketData.trend,
      capacitor_charge: marketData.capacitor_charge,
      fairness_score: marketData.fairness_score
    });
  }

  /**
   * Broadcast to index-designer (catalog values)
   */
  broadcastToIndexDesigner(catalogData) {
    return this.broadcastUpdate('index-designer', {
      type: 'catalog_values',
      items: catalogData.items,
      alc_prices: catalogData.alc_prices,
      usd_estimates: catalogData.usd_estimates
    });
  }

  /**
   * Broadcast to all repos (price changes)
   */
  broadcastToAllRepos(changeData) {
    return this.broadcastUpdate('ALL_REPOS', {
      type: 'price_changes',
      changes: changeData.changes,
      change_percent: changeData.change_percent,
      reason: changeData.reason,
      domino_effect_active: true
    });
  }

  /**
   * Broadcast update based on frequency and conditions
   */
  conditionalBroadcast(target, data, forceUpdate = false) {
    const targetConfig = this.broadcastTargets.get(target);
    
    if (!targetConfig) {
      return { sent: false, error: 'Unknown target' };
    }

    const now = Date.now();
    const timeSinceLastSent = targetConfig.lastSent 
      ? now - targetConfig.lastSent 
      : Infinity;

    // Check frequency requirements
    let shouldSend = forceUpdate;
    
    switch (targetConfig.frequency) {
      case 'real_time':
        shouldSend = true;
        break;
      case 'every_5_minutes':
        shouldSend = shouldSend || timeSinceLastSent > 5 * 60 * 1000;
        break;
      case 'on_change':
        shouldSend = shouldSend || data.hasChanged;
        break;
      case 'on_significant_change':
        shouldSend = shouldSend || (data.changePercent && Math.abs(data.changePercent) > 5);
        break;
    }

    if (shouldSend) {
      return this.broadcastUpdate(target, data);
    }

    return {
      sent: false,
      reason: 'frequency_requirement_not_met',
      target,
      frequency: targetConfig.frequency,
      time_since_last: timeSinceLastSent
    };
  }

  /**
   * Cascade price updates (domino effect)
   */
  cascadePriceUpdates(priceChangeData) {
    const { 
      originalPrice, 
      newPrice, 
      changePercent, 
      reason 
    } = priceChangeData;

    // Check if change exceeds threshold for domino effect
    const threshold = this.config.domino_effect.threshold || 0.05;
    
    if (Math.abs(changePercent) < threshold) {
      return {
        cascade_triggered: false,
        reason: 'change_below_threshold',
        threshold: `${threshold * 100}%`,
        actual_change: `${Math.abs(changePercent * 100)}%`
      };
    }

    // Trigger domino effect - cascade to all targets
    const results = [];
    
    this.broadcastTargets.forEach((config, target) => {
      const result = this.broadcastUpdate(target, {
        cascaded_update: true,
        original_price: originalPrice,
        new_price: newPrice,
        change_percent: changePercent,
        reason,
        domino_effect: this.config.domino_effect.cascade
      });
      results.push(result);
    });

    return {
      cascade_triggered: true,
      threshold_exceeded: true,
      targets_updated: results.length,
      results,
      domino_effect: 'price_adjusts_cascade_everywhere'
    };
  }

  /**
   * Get broadcast status
   */
  getBroadcastStatus() {
    const targetStats = {};
    
    this.broadcastTargets.forEach((config, target) => {
      const targetUpdates = this.sentUpdates.filter(u => u.target === target);
      targetStats[target] = {
        signal: config.signal,
        frequency: config.frequency,
        last_sent: config.lastSent,
        total_sent: targetUpdates.length
      };
    });

    return {
      active_targets: this.broadcastTargets.size,
      total_updates_sent: this.sentUpdates.length,
      target_statistics: targetStats,
      hydrogen_bonds: this.config.hydrogen_bonds.enabled ? 'active' : 'inactive',
      propagation_speed: this.config.hydrogen_bonds.propagation_speed,
      status: 'broadcasting_updates'
    };
  }

  /**
   * Get recent broadcasts for monitoring
   */
  getRecentBroadcasts(limit = 10) {
    return {
      updates: this.sentUpdates.slice(-limit),
      total_sent: this.sentUpdates.length,
      active_targets: Array.from(this.broadcastTargets.keys())
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceBroadcaster;
}
