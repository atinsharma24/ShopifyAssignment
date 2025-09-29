/**
 * Unit tests for Pricing module
 * Tests pricing calculations, discount applications, and UI updates
 */

const Pricing = require('../../src/js/ui/pricing.js');

describe('Pricing Module', () => {
  let pricing;

  beforeEach(() => {
    pricing = new Pricing();
    createTestDOM();
  });

  describe('calculateFinalPrices', () => {
    test('calculates correct prices for $25.00 original price', () => {
      const originalPrice = 2500; // $25.00 in cents
      const result = pricing.calculateFinalPrices(originalPrice);

      expect(result.original).toBe(2500);
      expect(result.subscriptionBeforeDiscount).toBe(1875); // 25% off: 2500 * 0.75
      expect(result.finalMain).toBe(2000); // 20% off: 2500 * 0.80
      expect(result.finalSubscription).toBe(1500); // 25% + 20% off: 2500 * 0.60
      expect(result.mainSavings).toBe(500); // $5.00 savings
      expect(result.subscriptionSavings).toBe(1000); // $10.00 savings
      expect(result.subscriptionSavingsPercent).toBe(40); // 40% total savings
    });

    test('calculates correct prices for $10.00 original price', () => {
      const originalPrice = 1000; // $10.00 in cents
      const result = pricing.calculateFinalPrices(originalPrice);

      expect(result.original).toBe(1000);
      expect(result.subscriptionBeforeDiscount).toBe(750); // 25% off: 1000 * 0.75
      expect(result.finalMain).toBe(800); // 20% off: 1000 * 0.80
      expect(result.finalSubscription).toBe(600); // 25% + 20% off: 1000 * 0.60
      expect(result.mainSavings).toBe(200); // $2.00 savings
      expect(result.subscriptionSavings).toBe(400); // $4.00 savings
      expect(result.subscriptionSavingsPercent).toBe(40); // 40% total savings
    });

    test('calculates correct prices for $50.00 original price', () => {
      const originalPrice = 5000; // $50.00 in cents
      const result = pricing.calculateFinalPrices(originalPrice);

      expect(result.original).toBe(5000);
      expect(result.subscriptionBeforeDiscount).toBe(3750); // 25% off: 5000 * 0.75
      expect(result.finalMain).toBe(4000); // 20% off: 5000 * 0.80
      expect(result.finalSubscription).toBe(3000); // 25% + 20% off: 5000 * 0.60
      expect(result.mainSavings).toBe(1000); // $10.00 savings
      expect(result.subscriptionSavings).toBe(2000); // $20.00 savings
      expect(result.subscriptionSavingsPercent).toBe(40); // 40% total savings
    });

    test('handles odd cent amounts correctly', () => {
      const originalPrice = 2599; // $25.99 in cents
      const result = pricing.calculateFinalPrices(originalPrice);

      expect(result.original).toBe(2599);
      expect(result.subscriptionBeforeDiscount).toBe(1949); // 25% off: 2599 * 0.75, rounded
      expect(result.finalMain).toBe(2079); // 20% off: 2599 * 0.80, rounded
      expect(result.finalSubscription).toBe(1559); // 25% + 20% off: 2599 * 0.60, rounded
    });

    test('handles zero price correctly', () => {
      const originalPrice = 0;
      const result = pricing.calculateFinalPrices(originalPrice);

      expect(result.original).toBe(0);
      expect(result.subscriptionBeforeDiscount).toBe(0);
      expect(result.finalMain).toBe(0);
      expect(result.finalSubscription).toBe(0);
      expect(result.mainSavings).toBe(0);
      expect(result.subscriptionSavings).toBe(0);
      expect(result.subscriptionSavingsPercent).toBe(0);
    });

    test('rounds all calculations to avoid floating point issues', () => {
      const originalPrice = 3333; // Amount that would cause floating point issues
      const result = pricing.calculateFinalPrices(originalPrice);

      // All results should be integers
      expect(Number.isInteger(result.original)).toBe(true);
      expect(Number.isInteger(result.subscriptionBeforeDiscount)).toBe(true);
      expect(Number.isInteger(result.finalMain)).toBe(true);
      expect(Number.isInteger(result.finalSubscription)).toBe(true);
      expect(Number.isInteger(result.mainSavings)).toBe(true);
      expect(Number.isInteger(result.subscriptionSavings)).toBe(true);
    });
  });

  describe('formatPrice', () => {
    test('formats USD prices correctly', () => {
      expect(pricing.formatPrice(2500)).toBe('$25.00');
      expect(pricing.formatPrice(1000)).toBe('$10.00');
      expect(pricing.formatPrice(999)).toBe('$9.99');
      expect(pricing.formatPrice(0)).toBe('$0.00');
      expect(pricing.formatPrice(1)).toBe('$0.01');
      expect(pricing.formatPrice(10000)).toBe('$100.00');
    });

    test('handles different currency codes', () => {
      expect(pricing.formatPrice(2500, 'EUR')).toContain('25.00');
      expect(pricing.formatPrice(2500, 'GBP')).toContain('25.00');
    });
  });

  describe('updatePriceDisplay', () => {
    test('updates main price element', () => {
      const variantPrice = 2500;
      pricing.updatePriceDisplay(variantPrice);

      const mainPriceElement = document.querySelector('[data-price-type="main"]');
      expect(mainPriceElement.textContent).toBe('$20.00'); // 2500 * 0.80 = 2000 cents = $20.00
      expect(mainPriceElement.getAttribute('data-original-price')).toBe('2500');
    });

    test('updates subscription price element', () => {
      const variantPrice = 2500;
      pricing.updatePriceDisplay(variantPrice);

      const subscriptionPriceElement = document.querySelector('[data-price-type="subscription"]');
      expect(subscriptionPriceElement.textContent).toBe('$15.00'); // 2500 * 0.60 = 1500 cents = $15.00
      expect(subscriptionPriceElement.getAttribute('data-original-price')).toBe('2500');
    });

    test('updates savings display', () => {
      document.body.innerHTML += '<span class="price__subscription-savings"></span>';
      const variantPrice = 2500;
      pricing.updatePriceDisplay(variantPrice);

      const savingsElement = document.querySelector('.price__subscription-savings');
      expect(savingsElement.textContent).toBe('Save 40%');
    });

    test('triggers priceUpdated event', (done) => {
      const variantPrice = 2500;
      
      document.addEventListener('priceUpdated', (event) => {
        expect(event.detail.variantPrice).toBe(variantPrice);
        expect(event.detail.calculatedPrices.finalMain).toBe(2000);
        expect(event.detail.calculatedPrices.finalSubscription).toBe(1500);
        done();
      });

      pricing.updatePriceDisplay(variantPrice);
    });
  });

  describe('getPriceBreakdown', () => {
    test('provides complete price breakdown', () => {
      const originalPrice = 2500;
      const breakdown = pricing.getPriceBreakdown(originalPrice);

      expect(breakdown.original.cents).toBe(2500);
      expect(breakdown.original.formatted).toBe('$25.00');
      expect(breakdown.original.label).toBe('Original Price');

      expect(breakdown.mainWithDiscount.cents).toBe(2000);
      expect(breakdown.mainWithDiscount.formatted).toBe('$20.00');
      expect(breakdown.mainWithDiscount.label).toBe('One-time Purchase (20% off)');
      expect(breakdown.mainWithDiscount.savings).toBe('$5.00');

      expect(breakdown.subscriptionWithDiscount.cents).toBe(1500);
      expect(breakdown.subscriptionWithDiscount.formatted).toBe('$15.00');
      expect(breakdown.subscriptionWithDiscount.label).toBe('Subscription (25% + 20% off)');
      expect(breakdown.subscriptionWithDiscount.savings).toBe('$10.00');
      expect(breakdown.subscriptionWithDiscount.savingsPercent).toBe('40%');
    });
  });

  describe('validateCalculations', () => {
    test('validates correct calculations', () => {
      expect(pricing.validateCalculations(2500)).toBe(true);
      expect(pricing.validateCalculations(1000)).toBe(true);
      expect(pricing.validateCalculations(5000)).toBe(true);
      expect(pricing.validateCalculations(0)).toBe(true);
    });

    test('would detect incorrect calculations', () => {
      // Mock incorrect calculation for testing
      const originalCalculate = pricing.calculateFinalPrices;
      pricing.calculateFinalPrices = () => ({
        subscriptionBeforeDiscount: 1000, // Incorrect value
        finalMain: 1000, // Incorrect value
        finalSubscription: 1000 // Incorrect value
      });

      expect(pricing.validateCalculations(2500)).toBe(false);

      // Restore original method
      pricing.calculateFinalPrices = originalCalculate;
    });
  });

  describe('Discount Constants', () => {
    test('has correct discount constants', () => {
      expect(pricing.SUBSCRIPTION_DISCOUNT).toBe(0.25); // 25%
      expect(pricing.SITE_WIDE_DISCOUNT).toBe(0.20); // 20%
    });
  });

  describe('Error Handling', () => {
    test('handles invalid price inputs gracefully', () => {
      expect(() => pricing.calculateFinalPrices(-100)).not.toThrow();
      expect(() => pricing.calculateFinalPrices(null)).not.toThrow();
      expect(() => pricing.calculateFinalPrices(undefined)).not.toThrow();
    });

    test('handles missing DOM elements gracefully', () => {
      document.body.innerHTML = ''; // Remove all elements
      expect(() => pricing.updatePriceDisplay(2500)).not.toThrow();
    });
  });

  describe('Integration with requirement formulas', () => {
    test('matches exact requirement: mainPrice * 0.75 for subscription before site discount', () => {
      const mainPrice = 10000; // $100.00
      const result = pricing.calculateFinalPrices(mainPrice);
      
      expect(result.subscriptionBeforeDiscount).toBe(mainPrice * 0.75);
    });

    test('matches exact requirement: final main price = mainPrice * 0.80', () => {
      const mainPrice = 10000; // $100.00
      const result = pricing.calculateFinalPrices(mainPrice);
      
      expect(result.finalMain).toBe(mainPrice * 0.80);
    });

    test('matches exact requirement: final subscription = mainPrice * 0.60', () => {
      const mainPrice = 10000; // $100.00
      const result = pricing.calculateFinalPrices(mainPrice);
      
      expect(result.finalSubscription).toBe(mainPrice * 0.60);
    });
  });
});