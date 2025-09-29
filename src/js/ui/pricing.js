/**
 * Pricing Module - Handles pricing calculations with subscription and site-wide discounts
 * 
 * Pricing Logic:
 * - Subscription Price = mainPrice * 0.75 (25% off main price)
 * - Site-wide discount = 20% off all prices
 * - Final Main Price = mainPrice * 0.80 (20% off main)
 * - Final Subscription Price = (mainPrice * 0.75) * 0.80 = mainPrice * 0.60 (25% + 20% off)
 */
class Pricing {
  constructor() {
    this.SUBSCRIPTION_DISCOUNT = 0.25; // 25% off for subscription
    this.SITE_WIDE_DISCOUNT = 0.20;    // 20% off site-wide
  }

  /**
   * Calculate final prices with all discounts applied
   * @param {number} mainPriceCents - Original price in cents
   * @returns {Object} - Object with all calculated prices
   */
  calculateFinalPrices(mainPriceCents) {
    // Ensure we're working with integers to avoid floating point issues
    const originalPrice = Math.round(mainPriceCents);
    
    // Calculate subscription price (25% off original)
    const subscriptionPrice = Math.round(originalPrice * (1 - this.SUBSCRIPTION_DISCOUNT));
    
    // Apply site-wide discount to both prices
    const finalMain = Math.round(originalPrice * (1 - this.SITE_WIDE_DISCOUNT));
    const finalSubscription = Math.round(subscriptionPrice * (1 - this.SITE_WIDE_DISCOUNT));
    
    // Calculate savings
    const mainSavings = originalPrice - finalMain;
    const subscriptionSavings = originalPrice - finalSubscription;
    const subscriptionSavingsPercent = originalPrice > 0 ? Math.round((subscriptionSavings / originalPrice) * 100) : 0;

    return {
      original: originalPrice,
      subscriptionBeforeDiscount: subscriptionPrice,
      finalMain: finalMain,
      finalSubscription: finalSubscription,
      mainSavings: mainSavings,
      subscriptionSavings: subscriptionSavings,
      subscriptionSavingsPercent: subscriptionSavingsPercent
    };
  }

  /**
   * Format price in cents to currency string
   * @param {number} cents - Price in cents
   * @param {string} currencyCode - Currency code (default: 'USD')
   * @returns {string} - Formatted price string
   */
  formatPrice(cents, currencyCode = 'USD') {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(dollars);
  }

  /**
   * Update price display in the UI
   * @param {number} variantPrice - Variant price in cents
   */
  updatePriceDisplay(variantPrice) {
    const prices = this.calculateFinalPrices(variantPrice);
    
    // Update main price
    const mainPriceElement = document.querySelector('[data-price-type="main"]');
    if (mainPriceElement) {
      mainPriceElement.textContent = this.formatPrice(prices.finalMain);
      mainPriceElement.setAttribute('data-original-price', variantPrice);
    }

    // Update subscription price
    const subscriptionPriceElement = document.querySelector('[data-price-type="subscription"]');
    if (subscriptionPriceElement) {
      subscriptionPriceElement.textContent = this.formatPrice(prices.finalSubscription);
      subscriptionPriceElement.setAttribute('data-original-price', variantPrice);
    }

    // Update savings display
    const savingsElement = document.querySelector('.price__subscription-savings');
    if (savingsElement) {
      savingsElement.textContent = `Save ${prices.subscriptionSavingsPercent}%`;
    }

    // Update compare at price if it exists
    this.updateCompareAtPrice(variantPrice, prices);

    // Trigger custom event for other modules that might need price updates
    const priceUpdateEvent = new CustomEvent('priceUpdated', {
      detail: {
        variantPrice: variantPrice,
        calculatedPrices: prices
      }
    });
    document.dispatchEvent(priceUpdateEvent);
  }

  /**
   * Update compare at price display
   * @param {number} variantPrice - Current variant price
   * @param {Object} calculatedPrices - Calculated prices object
   */
  updateCompareAtPrice(variantPrice, calculatedPrices) {
    const compareAtElements = document.querySelectorAll('.price__compare-price');
    
    compareAtElements.forEach(element => {
      // Show original price as compare-at price for subscription
      const parentContainer = element.closest('.price__subscription-price');
      if (parentContainer) {
        // For subscription, show original price as compare-at
        element.textContent = this.formatPrice(calculatedPrices.original);
        element.style.display = 'inline';
      } else {
        // For main price, only show if there's a higher compare-at price set
        // This would come from the variant's compare_at_price field
        const originalCompareAt = element.getAttribute('data-original-compare-at');
        if (originalCompareAt && parseInt(originalCompareAt) > variantPrice) {
          element.textContent = this.formatPrice(parseInt(originalCompareAt));
          element.style.display = 'inline';
        } else {
          element.style.display = 'none';
        }
      }
    });
  }

  /**
   * Get price breakdown for display or debugging
   * @param {number} originalPrice - Original price in cents
   * @returns {Object} - Detailed price breakdown
   */
  getPriceBreakdown(originalPrice) {
    const prices = this.calculateFinalPrices(originalPrice);
    
    return {
      original: {
        cents: prices.original,
        formatted: this.formatPrice(prices.original),
        label: 'Original Price'
      },
      mainWithDiscount: {
        cents: prices.finalMain,
        formatted: this.formatPrice(prices.finalMain),
        label: 'One-time Purchase (20% off)',
        savings: this.formatPrice(prices.mainSavings)
      },
      subscriptionWithDiscount: {
        cents: prices.finalSubscription,
        formatted: this.formatPrice(prices.finalSubscription),
        label: 'Subscription (25% + 20% off)',
        savings: this.formatPrice(prices.subscriptionSavings),
        savingsPercent: `${prices.subscriptionSavingsPercent}%`
      }
    };
  }

  /**
   * Validate price calculations (useful for testing)
   * @param {number} inputPrice - Input price to test
   * @returns {boolean} - Whether calculations are correct
   */
  validateCalculations(inputPrice) {
    const prices = this.calculateFinalPrices(inputPrice);
    
    // Test that subscription price is 25% off original
    const expectedSubscriptionBeforeDiscount = Math.round(inputPrice * 0.75);
    
    // Test that final prices have 20% discount applied
    const expectedFinalMain = Math.round(inputPrice * 0.80);
    const expectedFinalSubscription = Math.round(inputPrice * 0.60);
    
    return (
      prices.subscriptionBeforeDiscount === expectedSubscriptionBeforeDiscount &&
      prices.finalMain === expectedFinalMain &&
      prices.finalSubscription === expectedFinalSubscription
    );
  }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Pricing;
} else {
  // Make available globally in browser
  window.Pricing = Pricing;
}