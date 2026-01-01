/**
 * Capacitor Model Module
 * Implements capacitor discharge pricing physics
 */

class CapacitorModel {
  constructor(config) {
    this.charge = 0.5;          // Current charge level (0-1)
    this.maxCharge = 1.0;       // Maximum charge capacity
    this.balanceThreshold = config?.pricing_model?.balance_threshold || 0.75;
    this.dischargeRate = 0.1;   // Rate of discharge on purchase
    this.chargeRate = 0.05;     // Rate of charge from activity
  }

  /**
   * Accumulate charge from activity
   */
  accumulateCharge(activityLevel) {
    // activityLevel: 0-1 representing normalized activity
    const chargeIncrease = activityLevel * this.chargeRate;
    this.charge = Math.min(this.charge + chargeIncrease, this.maxCharge);

    return {
      activity_level: activityLevel.toFixed(2),
      charge_increase: chargeIncrease.toFixed(3),
      current_charge: this.charge.toFixed(3),
      status: this.getChargeStatus(),
      price_impact: this.getPriceImpact()
    };
  }

  /**
   * Discharge on purchase
   */
  dischargeOnPurchase(purchaseSize) {
    // purchaseSize: normalized value 0-1
    const dischargeAmount = purchaseSize * this.dischargeRate;
    this.charge = Math.max(this.charge - dischargeAmount, 0);

    return {
      purchase_size: purchaseSize.toFixed(2),
      discharge_amount: dischargeAmount.toFixed(3),
      remaining_charge: this.charge.toFixed(3),
      status: this.getChargeStatus(),
      price_impact: this.getPriceImpact()
    };
  }

  /**
   * Get current charge status
   */
  getChargeStatus() {
    if (this.charge > this.balanceThreshold) {
      return 'high_charge';
    } else if (this.charge < (1 - this.balanceThreshold)) {
      return 'low_charge';
    } else {
      return 'balanced';
    }
  }

  /**
   * Calculate price impact based on charge level
   */
  getPriceImpact() {
    const status = this.getChargeStatus();
    
    if (status === 'high_charge') {
      // High charge = prices increase slightly
      const increase = (this.charge - this.balanceThreshold) * 0.2;
      return {
        type: 'increase',
        multiplier: (1 + increase).toFixed(3),
        reason: 'high_activity_detected',
        description: 'prices_increase_slightly'
      };
    } else if (status === 'low_charge') {
      // Low charge = prices decrease slightly
      const decrease = ((1 - this.balanceThreshold) - this.charge) * 0.2;
      return {
        type: 'decrease',
        multiplier: (1 - decrease).toFixed(3),
        reason: 'low_activity_detected',
        description: 'prices_decrease_slightly'
      };
    } else {
      // Balanced = fair stable pricing
      return {
        type: 'stable',
        multiplier: '1.000',
        reason: 'balanced_activity',
        description: 'fair_stable_pricing'
      };
    }
  }

  /**
   * Apply capacitor pricing model to a base price
   */
  applyCapacitorPricing(basePrice) {
    const impact = this.getPriceImpact();
    const multiplier = parseFloat(impact.multiplier);
    const adjustedPrice = basePrice * multiplier;

    return {
      base_price: basePrice,
      capacitor_charge: this.charge.toFixed(3),
      charge_status: this.getChargeStatus(),
      price_multiplier: multiplier.toFixed(3),
      adjusted_price: adjustedPrice.toFixed(2),
      pricing_model: 'capacitor_discharge',
      fair_pricing: impact.type === 'stable' ? 'guaranteed' : 'dynamic'
    };
  }

  /**
   * Get capacitor state for monitoring
   */
  getCapacitorState() {
    return {
      charge_level: this.charge.toFixed(3),
      charge_percent: (this.charge * 100).toFixed(1) + '%',
      max_capacity: this.maxCharge,
      balance_threshold: this.balanceThreshold,
      status: this.getChargeStatus(),
      price_impact: this.getPriceImpact(),
      model: {
        high_charge: 'prices_increase_slightly',
        low_charge: 'prices_decrease_slightly',
        balanced: 'fair_stable_pricing'
      }
    };
  }

  /**
   * Auto-balance capacitor over time
   */
  autoBalance() {
    const targetCharge = 0.5;
    const balanceRate = 0.02;
    
    if (this.charge > targetCharge) {
      this.charge -= Math.min(this.charge - targetCharge, balanceRate);
    } else if (this.charge < targetCharge) {
      this.charge += Math.min(targetCharge - this.charge, balanceRate);
    }

    return {
      target_charge: targetCharge,
      current_charge: this.charge.toFixed(3),
      auto_balancing: true,
      status: 'maintaining_fair_pricing'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CapacitorModel;
}
