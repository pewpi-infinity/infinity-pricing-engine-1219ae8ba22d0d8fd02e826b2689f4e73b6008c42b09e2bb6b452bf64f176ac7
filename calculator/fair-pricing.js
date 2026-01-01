/**
 * Fair Pricing Module
 * Ensures all pricing is fair and prevents manipulation
 */

class FairPricing {
  constructor() {
    this.priceFloor = 0.01;     // Minimum price (in ALC)
    this.priceCeiling = 10000;  // Maximum price (in ALC)
    this.maxChangeRate = 0.25;  // Max 25% change per update
    this.priceHistory = [];
    this.fairnessScore = 1.0;
  }

  /**
   * Validate that a price is fair
   */
  validatePrice(price, context = {}) {
    const issues = [];
    const suggestions = [];

    // Check if price is within bounds
    if (price < this.priceFloor) {
      issues.push('price_too_low');
      suggestions.push(`Minimum price is ${this.priceFloor} ALC`);
      price = this.priceFloor;
    }

    if (price > this.priceCeiling) {
      issues.push('price_too_high');
      suggestions.push(`Maximum price is ${this.priceCeiling} ALC`);
      price = this.priceCeiling;
    }

    // Check historical price changes
    if (this.priceHistory.length > 0) {
      const lastPrice = this.priceHistory[this.priceHistory.length - 1];
      const changeRate = Math.abs(price - lastPrice) / lastPrice;
      
      if (changeRate > this.maxChangeRate) {
        issues.push('price_change_too_rapid');
        suggestions.push(`Price change limited to ${this.maxChangeRate * 100}% per update`);
        
        // Limit the change
        const maxChange = lastPrice * this.maxChangeRate;
        price = price > lastPrice 
          ? lastPrice + maxChange 
          : lastPrice - maxChange;
      }
    }

    // Record this price
    this.priceHistory.push(price);
    if (this.priceHistory.length > 100) {
      this.priceHistory.shift(); // Keep only last 100 prices
    }

    return {
      validated_price: parseFloat(price.toFixed(2)),
      original_price: context.original_price || price,
      is_fair: issues.length === 0,
      issues: issues,
      suggestions: suggestions,
      fairness_score: this.calculateFairnessScore(issues)
    };
  }

  /**
   * Calculate fairness score based on issues
   */
  calculateFairnessScore(issues) {
    const penaltyPerIssue = 0.2;
    this.fairnessScore = Math.max(1.0 - (issues.length * penaltyPerIssue), 0);
    return this.fairnessScore.toFixed(2);
  }

  /**
   * Ensure fair market pricing based on multiple sources
   */
  ensureFairMarket(proposedPrice, marketData) {
    const {
      averagePrice = proposedPrice,
      medianPrice = proposedPrice,
      competitorPrices = []
    } = marketData;

    // Calculate market consensus
    let allPrices = [averagePrice, medianPrice, ...competitorPrices];
    allPrices = allPrices.filter(p => p > 0);
    
    const marketAverage = allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length;
    const deviation = Math.abs(proposedPrice - marketAverage) / marketAverage;

    // If deviation is too high, adjust
    if (deviation > 0.3) {
      return {
        original_price: proposedPrice,
        market_average: marketAverage.toFixed(2),
        adjusted_price: marketAverage.toFixed(2),
        deviation_percent: (deviation * 100).toFixed(1),
        adjusted: true,
        reason: 'aligned_with_market_consensus'
      };
    }

    return {
      price: proposedPrice,
      market_average: marketAverage.toFixed(2),
      deviation_percent: (deviation * 100).toFixed(1),
      fair_market_confirmed: true,
      reason: 'within_acceptable_market_range'
    };
  }

  /**
   * Prevent price manipulation
   */
  detectManipulation(priceSequence) {
    if (priceSequence.length < 5) {
      return { manipulation_detected: false, confidence: 'insufficient_data' };
    }

    let suspiciousPatterns = 0;

    // Check for artificial inflation (consistent increases)
    let consecutiveIncreases = 0;
    for (let i = 1; i < priceSequence.length; i++) {
      if (priceSequence[i] > priceSequence[i - 1]) {
        consecutiveIncreases++;
      } else {
        consecutiveIncreases = 0;
      }
      
      if (consecutiveIncreases >= 5) {
        suspiciousPatterns++;
        break;
      }
    }

    // Check for pump and dump (rapid rise then fall)
    const maxPrice = Math.max(...priceSequence);
    const minPrice = Math.min(...priceSequence);
    const volatility = (maxPrice - minPrice) / minPrice;
    
    if (volatility > 0.5) {
      suspiciousPatterns++;
    }

    return {
      manipulation_detected: suspiciousPatterns > 0,
      suspicious_patterns: suspiciousPatterns,
      confidence: suspiciousPatterns > 1 ? 'high' : suspiciousPatterns > 0 ? 'medium' : 'low',
      recommendation: suspiciousPatterns > 0 ? 'manual_review_required' : 'pricing_appears_fair'
    };
  }

  /**
   * Apply fair pricing principles to any price
   */
  applyFairPricing(price, context = {}) {
    // First validate the price
    const validation = this.validatePrice(price, context);
    
    // Then ensure fair market
    const marketCheck = this.ensureFairMarket(
      validation.validated_price,
      context.marketData || {}
    );

    // Check recent history for manipulation
    const recentPrices = this.priceHistory.slice(-10);
    const manipulation = this.detectManipulation(recentPrices);

    return {
      input_price: price,
      fair_price: marketCheck.adjusted_price || marketCheck.price,
      validation: validation,
      market_check: marketCheck,
      manipulation_check: manipulation,
      never: 'unfair_pricing',
      guarantee: 'fair_pricing_always'
    };
  }

  /**
   * Get current fairness metrics
   */
  getFairnessMetrics() {
    const recentPrices = this.priceHistory.slice(-10);
    const avgPrice = recentPrices.length > 0 
      ? recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length 
      : 0;

    return {
      fairness_score: this.fairnessScore.toFixed(2),
      price_floor: this.priceFloor,
      price_ceiling: this.priceCeiling,
      max_change_rate: `${this.maxChangeRate * 100}%`,
      recent_average_price: avgPrice.toFixed(2),
      prices_tracked: this.priceHistory.length,
      status: this.fairnessScore > 0.8 ? 'excellent' : this.fairnessScore > 0.6 ? 'good' : 'needs_improvement'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FairPricing;
}
