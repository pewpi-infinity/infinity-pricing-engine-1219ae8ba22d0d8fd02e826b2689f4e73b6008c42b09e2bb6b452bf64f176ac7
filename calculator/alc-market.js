/**
 * ALC Market Module
 * Manages Andy Lian Coin market dynamics and real-time pricing
 */

class ALCMarket {
  constructor(pricingConfig) {
    this.config = pricingConfig.andy_lian_coin;
    this.currentValue = this.config.current_usd_value;
    this.dailyVolume = this.config.daily_volume;
    this.trendPercent = this.config.trend_percent;
    this.volatility = this.config.market_forces.volatility;
  }

  /**
   * Get current ALC value in USD
   */
  getCurrentValue() {
    return {
      alc_usd: this.currentValue,
      volume: this.dailyVolume,
      trend: this.trendPercent,
      formatted: `1 ALC = $${this.currentValue.toFixed(2)} USD`
    };
  }

  /**
   * Calculate ALC earned for an activity
   */
  calculateEarnings(activityType) {
    const rate = this.config.earn_rates[activityType];
    if (!rate) {
      return { error: `Unknown activity type: ${activityType}` };
    }
    
    return {
      activity: activityType,
      alc_earned: rate,
      usd_value: (rate * this.currentValue).toFixed(2),
      message: `Earned ${rate} ALC for ${activityType.replace(/_/g, ' ')}`
    };
  }

  /**
   * Calculate cost for a purchase
   */
  calculateCost(itemType) {
    const cost = this.config.spend_costs[itemType];
    if (!cost) {
      return { error: `Unknown item type: ${itemType}` };
    }
    
    return {
      item: itemType,
      alc_cost: cost,
      usd_value: (cost * this.currentValue).toFixed(2),
      message: `${itemType.replace(/_/g, ' ')} costs ${cost} ALC`
    };
  }

  /**
   * Update market value based on supply and demand
   */
  adjustMarketValue(supplyDemandRatio) {
    const oldValue = this.currentValue;
    
    // High demand (ratio > 1) increases price
    // High supply (ratio < 1) decreases price
    const adjustment = (supplyDemandRatio - 1) * this.volatility;
    this.currentValue += this.currentValue * adjustment;
    
    // Calculate trend
    this.trendPercent = ((this.currentValue - oldValue) / oldValue) * 100;
    
    return {
      old_value: oldValue.toFixed(2),
      new_value: this.currentValue.toFixed(2),
      change_percent: this.trendPercent.toFixed(2),
      market_condition: supplyDemandRatio > 1 ? 'high_demand' : supplyDemandRatio < 1 ? 'abundant_supply' : 'stable'
    };
  }

  /**
   * Stabilize market via mongoose learning
   */
  stabilizeMarket() {
    const targetValue = this.config.current_usd_value;
    const stabilizationRate = 0.1;
    
    // Gradually move towards target value
    this.currentValue += (targetValue - this.currentValue) * stabilizationRate;
    
    return {
      stabilized_value: this.currentValue.toFixed(2),
      target_value: targetValue.toFixed(2),
      status: 'stabilizing_via_mongoose_learning'
    };
  }

  /**
   * Get market summary for dashboard
   */
  getMarketSummary() {
    return {
      current_value: this.currentValue.toFixed(2),
      daily_volume: this.dailyVolume,
      trend: `${this.trendPercent > 0 ? '📈' : '📉'} ${Math.abs(this.trendPercent).toFixed(1)}% today`,
      earn_rates: this.config.earn_rates,
      spend_costs: this.config.spend_costs
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ALCMarket;
}
