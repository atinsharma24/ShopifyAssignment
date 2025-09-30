import { PricingManager } from '../../src/ui/pricing';

jest.mock('../../src/utils/currency', () => ({
  formatMoney: jest.fn((cents: number) => `$${(cents / 100).toFixed(2)}`)
}));

describe('PricingManager', () => {
  let pricingManager: PricingManager;

  beforeEach(() => {
    pricingManager = new PricingManager();

    document.body.innerHTML = `
      <div data-main-price></div>
      <div data-main-original></div>
      <div data-main-savings><span class="savings-amount"></span></div>
      <div data-subscription-price></div>
      <div data-subscription-original></div>
      <div data-subscription-savings><span class="savings-amount"></span></div>
      <div data-per-serving-price></div>
      <div data-price-per-serving></div>
      <div data-breakdown-base></div>
      <div data-breakdown-subscription></div>
      <div data-breakdown-sitewide></div>
      <div data-breakdown-final></div>
    `;

    pricingManager.cacheElements();
  });

  describe('calculatePrices', () => {
    test('calculates correct prices for basic scenario', () => {
      const basePriceCents = 10000;
      const prices = pricingManager.calculatePrices(basePriceCents);

      expect(prices.basePrice).toBe(10000);
      expect(prices.subscriptionBeforeDiscount).toBe(7500);
      expect(prices.finalMainPrice).toBe(8000);
      expect(prices.finalSubscriptionPrice).toBe(6000);
      expect(prices.mainSavings).toBe(2000);
      expect(prices.subscriptionSavings).toBe(4000);
    });

    test('calculates correct prices for edge case amounts', () => {
      const testCases = [
        { input: 1000, expectedFinalSubscription: 600 },
        { input: 2500, expectedFinalSubscription: 1500 },
        { input: 9999, expectedFinalSubscription: 5999 },
        { input: 100, expectedFinalSubscription: 60 }
      ];

      testCases.forEach(({ input, expectedFinalSubscription }) => {
        const prices = pricingManager.calculatePrices(input);
        expect(prices.finalSubscriptionPrice).toBe(expectedFinalSubscription);
      });
    });

    test('handles zero and negative inputs gracefully', () => {
      const zeroPrices = pricingManager.calculatePrices(0);
      expect(zeroPrices.finalSubscriptionPrice).toBe(0);
      expect(zeroPrices.finalMainPrice).toBe(0);

      const negativePrices = pricingManager.calculatePrices(-1000);
      expect(negativePrices.finalSubscriptionPrice).toBe(-600);
    });

    test('rounds calculations correctly to avoid floating point issues', () => {
      const basePriceCents = 3333;
      const prices = pricingManager.calculatePrices(basePriceCents);

      expect(Number.isInteger(prices.subscriptionBeforeDiscount)).toBe(true);
      expect(Number.isInteger(prices.finalMainPrice)).toBe(true);
      expect(Number.isInteger(prices.finalSubscriptionPrice)).toBe(true);

      expect(prices.subscriptionBeforeDiscount).toBe(2500);
      expect(prices.finalMainPrice).toBe(2666);
      expect(prices.finalSubscriptionPrice).toBe(2000);
    });

    test('calculates percentage discounts correctly', () => {
      const basePriceCents = 10000;
      const prices = pricingManager.calculatePrices(basePriceCents);

      expect(prices.subscriptionDiscountPercent).toBe(25);
      expect(prices.sitewideDiscountPercent).toBe(20);
      expect(prices.totalSubscriptionDiscountPercent).toBe(40);
    });
  });

  describe('validatePricing', () => {
    test('validates pricing calculations against expected formulas', () => {
      const testPrices = [1000, 2500, 5000, 10000, 15000];

      testPrices.forEach((basePrice) => {
        const validation = pricingManager.validatePricing(basePrice);

        expect(validation.isValid).toBe(true);
        expect(validation.input).toBe(basePrice);
        expect(validation.calculated.finalSubscriptionPrice).toBe(
          validation.expected.finalSubscriptionPrice
        );
      });
    });

    test('provides formula explanations', () => {
      const validation = pricingManager.validatePricing(10000);

      expect(validation.formulas).toHaveProperty('subscriptionDiscount');
      expect(validation.formulas).toHaveProperty('sitewideDiscount');
      expect(validation.formulas).toHaveProperty('finalSubscription');
      expect(validation.formulas.finalSubscription).toContain('base * 0.60');
    });
  });

  describe('calculateMultipleItemsPricing', () => {
    test('calculates pricing for double mode correctly', () => {
      const basePriceCents = 5000;
      const doublePrice = pricingManager.calculateMultipleItemsPricing(basePriceCents, 2);

      expect(doublePrice.finalMainPrice).toBe(8000);
      expect(doublePrice.finalSubscriptionPrice).toBe(6000);
      expect(doublePrice.perItemFinalMain).toBe(4000);
      expect(doublePrice.perItemFinalSubscription).toBe(3000);
    });

    test('handles different quantities', () => {
      const basePriceCents = 2000;

      const triplePrice = pricingManager.calculateMultipleItemsPricing(basePriceCents, 3);
      const singlePrice = pricingManager.calculatePrices(basePriceCents);

      expect(triplePrice.finalSubscriptionPrice).toBe(singlePrice.finalSubscriptionPrice * 3);
    });
  });

  describe('calculateDiscountPercentage', () => {
    test('calculates discount percentages correctly', () => {
      const testCases = [
        { original: 10000, sale: 8000, expected: 20 },
        { original: 10000, sale: 5000, expected: 50 },
        { original: 10000, sale: 9000, expected: 10 },
        { original: 10000, sale: 10000, expected: 0 },
        { original: 0, sale: 0, expected: 0 }
      ];

      testCases.forEach(({ original, sale, expected }) => {
        const discount = pricingManager.calculateDiscountPercentage(original, sale);
        expect(discount).toBe(expected);
      });
    });

    test('handles edge cases', () => {
      expect(pricingManager.calculateDiscountPercentage(1000, 1500)).toBe(-50);
      expect(pricingManager.calculateDiscountPercentage(0, 500)).toBe(0);
    });
  });

  describe('DOM integration', () => {
    test('updateDisplay updates DOM elements correctly', () => {
      const basePriceCents = 10000;
      const prices = pricingManager.calculatePrices(basePriceCents);

      pricingManager.updateDisplay(prices, 'single');

      const mainPrice = document.querySelector('[data-main-price]');
      const subscriptionPrice = document.querySelector('[data-subscription-price]');

      expect(mainPrice?.textContent).toBe('$80.00');
      expect(subscriptionPrice?.textContent).toBe('$60.00');
    });

    test('updateDisplay handles double mode correctly', () => {
      const basePriceCents = 5000;
      const prices = pricingManager.calculatePrices(basePriceCents);

      pricingManager.updateDisplay(prices, 'double');

      const mainPrice = document.querySelector('[data-main-price]');
      const subscriptionPrice = document.querySelector('[data-subscription-price]');

      expect(mainPrice?.textContent).toBe('$80.00');
      expect(subscriptionPrice?.textContent).toBe('$60.00');
    });

    test('shows per-serving price only for double mode', () => {
      const prices = pricingManager.calculatePrices(5000);
      const perServingSection = document.querySelector('[data-price-per-serving]') as HTMLElement;

      pricingManager.updateDisplay(prices, 'single');
      expect(perServingSection.style.display).toBe('none');

      pricingManager.updateDisplay(prices, 'double');
      expect(perServingSection.style.display).toBe('block');
    });
  });

  describe('price breakdown', () => {
    test('updates price breakdown elements', () => {
      const basePriceCents = 10000;
      const prices = pricingManager.calculatePrices(basePriceCents);

      // Test via the public updateDisplay method which includes breakdown updates
      pricingManager.updateDisplay(prices, 'single');

      expect(document.querySelector('[data-breakdown-base]')?.textContent).toBe('$100.00');
      expect(document.querySelector('[data-breakdown-subscription]')?.textContent).toBe('-$25.00');
      expect(document.querySelector('[data-breakdown-sitewide]')?.textContent).toBe('-$15.00');
      expect(document.querySelector('[data-breakdown-final]')?.textContent).toBe('$60.00');
    });
  });
});
