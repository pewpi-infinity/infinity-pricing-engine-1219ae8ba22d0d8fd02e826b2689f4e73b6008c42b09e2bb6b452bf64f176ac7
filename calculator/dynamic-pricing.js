/**
 * Dynamic Pricing Module
 * Calculates fair prices based on complexity, time, demand
 */

class DynamicPricing {
  constructor() {
    this.priceHistory = [];
    this.demandMultiplier = 1.0;
  }

  /**
   * Calculate art price based on complexity and time
   */
  calculateArtPrice(params) {
    const {
      complexity = 'medium',  // low, medium, high
      timeSpent = 1,          // hours
      demand = 'normal'       // low, normal, high
    } = params;

    const complexityRates = {
      low: 5,
      medium: 10,
      high: 20
    };

    const demandMultipliers = {
      low: 0.8,
      normal: 1.0,
      high: 1.5
    };

    const baseRate = complexityRates[complexity] || 10;
    const demandFactor = demandMultipliers[demand] || 1.0;
    
    const price = baseRate * timeSpent * demandFactor;

    return {
      base_alc: baseRate,
      time_spent_hours: timeSpent,
      complexity_level: complexity,
      demand_level: demand,
      final_price_alc: Math.round(price),
      usd_estimate: '(multiply by current ALC rate)'
    };
  }

  /**
   * Calculate token value for new mints
   */
  calculateTokenValue(params) {
    const {
      type = 'standard',      // standard, premium, limited
      utility = 'medium',     // low, medium, high
      scarcity = 1000        // total supply
    } = params;

    const typeMultipliers = {
      standard: 1.0,
      premium: 2.0,
      limited: 3.0
    };

    const utilityRates = {
      low: 5,
      medium: 10,
      high: 20
    };

    const baseValue = utilityRates[utility] || 10;
    const typeMultiplier = typeMultipliers[type] || 1.0;
    const scarcityBonus = scarcity < 100 ? 2.0 : scarcity < 500 ? 1.5 : 1.0;

    const tokenValue = baseValue * typeMultiplier * scarcityBonus;

    return {
      token_type: type,
      utility_level: utility,
      total_supply: scarcity,
      scarcity_bonus: scarcityBonus,
      base_value_alc: Math.round(tokenValue),
      market_condition: 'fair_pricing_applied'
    };
  }

  /**
   * Calculate feature costs (premium vs free tiers)
   */
  calculateFeatureCost(params) {
    const {
      tier = 'free',          // free, basic, premium, enterprise
      features = [],          // array of feature names
      support = 'community'   // community, priority, dedicated
    } = params;

    const tierPricing = {
      free: 0,
      basic: 10,
      premium: 50,
      enterprise: 200
    };

    const supportCosts = {
      community: 0,
      priority: 15,
      dedicated: 50
    };

    const baseCost = tierPricing[tier] || 0;
    const supportCost = supportCosts[support] || 0;
    const featureBonus = features.length * 5;

    const totalCost = baseCost + supportCost + featureBonus;

    return {
      tier_level: tier,
      base_cost_alc: baseCost,
      support_type: support,
      support_cost_alc: supportCost,
      feature_count: features.length,
      total_cost_alc: totalCost,
      monthly_subscription: tier !== 'free'
    };
  }

  /**
   * Calculate minimal transaction fees (hydrogen bond cost)
   */
  calculateTransactionFee(transactionAmount) {
    // Minimal fee: 1% with 0.1 ALC minimum
    const feePercent = 0.01;
    const minimumFee = 0.1;
    
    const calculatedFee = transactionAmount * feePercent;
    const actualFee = Math.max(calculatedFee, minimumFee);

    return {
      transaction_amount_alc: transactionAmount,
      fee_percent: (feePercent * 100).toFixed(1),
      calculated_fee_alc: calculatedFee.toFixed(2),
      actual_fee_alc: actualFee.toFixed(2),
      fee_model: 'minimal_hydrogen_bond_cost'
    };
  }

  /**
   * Adjust prices in real-time based on activity
   */
  adjustRealTime(activityData) {
    const {
      supply = 1000,
      demand = 1000,
      recentActivity = 100
    } = activityData;

    const supplyDemandRatio = demand / supply;
    const activityMultiplier = 1 + (recentActivity / 1000);

    this.demandMultiplier = supplyDemandRatio * activityMultiplier;

    return {
      supply_level: supply,
      demand_level: demand,
      recent_activity: recentActivity,
      demand_multiplier: this.demandMultiplier.toFixed(2),
      market_state: supplyDemandRatio > 1.2 ? 'high_demand' : supplyDemandRatio < 0.8 ? 'low_demand' : 'balanced',
      mongoose_learning_active: true
    };
  }

  /**
   * Ensure no unfair pricing
   */
  validateFairPricing(price, marketAverage) {
    const deviationThreshold = 0.25; // 25% max deviation
    const deviation = Math.abs(price - marketAverage) / marketAverage;

    if (deviation > deviationThreshold) {
      return {
        original_price: price,
        market_average: marketAverage,
        adjusted_price: marketAverage * (1 + deviationThreshold * (price > marketAverage ? 1 : -1)),
        fair_pricing_enforced: true,
        reason: 'prevented_unfair_pricing'
      };
    }

    return {
      price: price,
      market_average: marketAverage,
      deviation_percent: (deviation * 100).toFixed(1),
      fair_pricing_verified: true
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicPricing;
}
