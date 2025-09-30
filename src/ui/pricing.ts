import { formatMoney, type FormatMoneyOptions } from '../utils/currency';

type PurchaseMode = 'single' | 'double';

type PricingElements = {
  mainPrice: HTMLElement | null;
  mainOriginal: HTMLElement | null;
  mainSavings: HTMLElement | null;
  subscriptionPrice: HTMLElement | null;
  subscriptionOriginal: HTMLElement | null;
  subscriptionSavings: HTMLElement | null;
  perServingPrice: HTMLElement | null;
  perServingSection: HTMLElement | null;
  breakdownBase: HTMLElement | null;
  breakdownSubscription: HTMLElement | null;
  breakdownSitewide: HTMLElement | null;
  breakdownFinal: HTMLElement | null;
};

export interface CalculatedPrices {
  basePrice: number;
  mainBeforeDiscount: number;
  subscriptionBeforeDiscount: number;
  finalMainPrice: number;
  finalSubscriptionPrice: number;
  mainSavings: number;
  subscriptionSavings: number;
  subscriptionDiscountPercent: number;
  sitewideDiscountPercent: number;
  totalSubscriptionDiscountPercent: number;
}

export interface MultipleItemsPricing extends CalculatedPrices {
  perItemFinalMain: number;
  perItemFinalSubscription: number;
}

export interface PricingValidation {
  isValid: boolean;
  input: number;
  calculated: CalculatedPrices;
  expected: {
    subscriptionBeforeDiscount: number;
    finalMainPrice: number;
    finalSubscriptionPrice: number;
  };
  formulas: {
    subscriptionDiscount: string;
    sitewideDiscount: string;
    finalSubscription: string;
  };
}

export class PricingManager {
  private readonly SUBSCRIPTION_DISCOUNT = 0.25;
  private readonly SITEWIDE_DISCOUNT = 0.2;
  private elements: PricingElements;

  constructor() {
    this.elements = {
      mainPrice: null,
      mainOriginal: null,
      mainSavings: null,
      subscriptionPrice: null,
      subscriptionOriginal: null,
      subscriptionSavings: null,
      perServingPrice: null,
      perServingSection: null,
      breakdownBase: null,
      breakdownSubscription: null,
      breakdownSitewide: null,
      breakdownFinal: null
    };

    this.cacheElements();
  }

  cacheElements(): void {
    this.elements = {
      mainPrice: document.querySelector('[data-main-price]'),
      mainOriginal: document.querySelector('[data-main-original]'),
      mainSavings: document.querySelector('[data-main-savings]'),
      subscriptionPrice: document.querySelector('[data-subscription-price]'),
      subscriptionOriginal: document.querySelector('[data-subscription-original]'),
      subscriptionSavings: document.querySelector('[data-subscription-savings]'),
      perServingPrice: document.querySelector('[data-per-serving-price]'),
      perServingSection: document.querySelector('[data-price-per-serving]'),
      breakdownBase: document.querySelector('[data-breakdown-base]'),
      breakdownSubscription: document.querySelector('[data-breakdown-subscription]'),
      breakdownSitewide: document.querySelector('[data-breakdown-sitewide]'),
      breakdownFinal: document.querySelector('[data-breakdown-final]')
    };
  }

  calculatePrices(basePriceCents: number): CalculatedPrices {
    const basePrice = Math.round(basePriceCents);
    const subscriptionBeforeDiscount = Math.round(basePrice * (1 - this.SUBSCRIPTION_DISCOUNT));
    const finalMainPrice = Math.round(basePrice * (1 - this.SITEWIDE_DISCOUNT));
    const finalSubscriptionPrice = Math.round(subscriptionBeforeDiscount * (1 - this.SITEWIDE_DISCOUNT));

    const mainSavings = basePrice - finalMainPrice;
    const subscriptionSavings = basePrice - finalSubscriptionPrice;

    return {
      basePrice,
      mainBeforeDiscount: basePrice,
      subscriptionBeforeDiscount,
      finalMainPrice,
      finalSubscriptionPrice,
      mainSavings,
      subscriptionSavings,
      subscriptionDiscountPercent: this.SUBSCRIPTION_DISCOUNT * 100,
      sitewideDiscountPercent: this.SITEWIDE_DISCOUNT * 100,
      totalSubscriptionDiscountPercent: basePrice === 0
        ? 0
        : ((basePrice - finalSubscriptionPrice) / basePrice) * 100
    };
  }

  updateDisplay(prices: CalculatedPrices, mode: PurchaseMode = 'single'): void {
    this.updateMainPricing(prices, mode);
    this.updateSubscriptionPricing(prices, mode);
    this.updatePerServingPricing(prices, mode);
    this.updatePriceBreakdown(prices);

    console.log('Pricing updated:', prices, 'Mode:', mode);
  }

  private updateMainPricing(prices: CalculatedPrices, mode: PurchaseMode): void {
    const { mainPrice, mainOriginal, mainSavings } = this.elements;

    if (mainPrice) {
      const displayPrice = mode === 'double' ? prices.finalMainPrice * 2 : prices.finalMainPrice;
      mainPrice.textContent = formatMoney(displayPrice);
    }

    if (mainOriginal) {
      const originalPrice = mode === 'double' ? prices.basePrice * 2 : prices.basePrice;
      if (prices.mainSavings > 0) {
        mainOriginal.textContent = formatMoney(originalPrice);
        mainOriginal.style.display = 'inline';
      } else {
        mainOriginal.style.display = 'none';
      }
    }

    if (mainSavings) {
      const savingsAmount = mode === 'double' ? prices.mainSavings * 2 : prices.mainSavings;
      const savingsAmountElement = mainSavings.querySelector<HTMLElement>('.savings-amount');
      if (savingsAmount > 0 && savingsAmountElement) {
        savingsAmountElement.textContent = formatMoney(savingsAmount);
        mainSavings.style.display = 'block';
      } else {
        mainSavings.style.display = 'none';
      }
    }
  }

  private updateSubscriptionPricing(prices: CalculatedPrices, mode: PurchaseMode): void {
    const { subscriptionPrice, subscriptionOriginal, subscriptionSavings } = this.elements;

    if (subscriptionPrice) {
      const displayPrice = mode === 'double' ? prices.finalSubscriptionPrice * 2 : prices.finalSubscriptionPrice;
      subscriptionPrice.textContent = formatMoney(displayPrice);
    }

    if (subscriptionOriginal) {
      const originalPrice = mode === 'double' ? prices.basePrice * 2 : prices.basePrice;
      subscriptionOriginal.textContent = formatMoney(originalPrice);
    }

    if (subscriptionSavings) {
      const savingsAmount = mode === 'double' ? prices.subscriptionSavings * 2 : prices.subscriptionSavings;
      const savingsAmountElement = subscriptionSavings.querySelector<HTMLElement>('.savings-amount');
      if (savingsAmountElement) {
        savingsAmountElement.textContent = formatMoney(savingsAmount);
      }
    }
  }

  private updatePerServingPricing(prices: CalculatedPrices, mode: PurchaseMode): void {
    const { perServingPrice, perServingSection } = this.elements;

    if (!perServingSection) {
      return;
    }

    if (mode === 'double') {
      if (perServingPrice) {
        perServingPrice.textContent = formatMoney(prices.finalSubscriptionPrice);
      }
      perServingSection.style.display = 'block';
      return;
    }

    perServingSection.style.display = 'none';
  }

  private updatePriceBreakdown(prices: CalculatedPrices): void {
    const { breakdownBase, breakdownSubscription, breakdownSitewide, breakdownFinal } = this.elements;

    if (breakdownBase) {
      breakdownBase.textContent = formatMoney(prices.basePrice);
    }

    if (breakdownSubscription) {
      const subscriptionDiscount = prices.basePrice - prices.subscriptionBeforeDiscount;
      breakdownSubscription.textContent = `-${formatMoney(subscriptionDiscount)}`;
    }

    if (breakdownSitewide) {
      const sitewideDiscount = Math.round(prices.subscriptionBeforeDiscount * this.SITEWIDE_DISCOUNT);
      breakdownSitewide.textContent = `-${formatMoney(sitewideDiscount)}`;
    }

    if (breakdownFinal) {
      breakdownFinal.textContent = formatMoney(prices.finalSubscriptionPrice);
    }
  }

  calculateMultipleItemsPricing(basePriceCents: number, quantity = 2): MultipleItemsPricing {
    const singlePrices = this.calculatePrices(basePriceCents);

    return {
      ...singlePrices,
      finalMainPrice: singlePrices.finalMainPrice * quantity,
      finalSubscriptionPrice: singlePrices.finalSubscriptionPrice * quantity,
      mainSavings: singlePrices.mainSavings * quantity,
      subscriptionSavings: singlePrices.subscriptionSavings * quantity,
      basePrice: singlePrices.basePrice * quantity,
      perItemFinalMain: singlePrices.finalMainPrice,
      perItemFinalSubscription: singlePrices.finalSubscriptionPrice
    };
  }

  getFormattedPrice(priceCents: number, options: FormatMoneyOptions = {}): string {
    return formatMoney(priceCents, options);
  }

  calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
    if (originalPrice <= 0) {
      return 0;
    }

    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  validatePricing(basePriceCents: number): PricingValidation {
    const prices = this.calculatePrices(basePriceCents);

    const expectedSubscriptionBeforeDiscount = Math.round(basePriceCents * 0.75);
    const expectedFinalMain = Math.round(basePriceCents * 0.8);
    const expectedFinalSubscription = Math.round(basePriceCents * 0.6);

    const isValid =
      prices.subscriptionBeforeDiscount === expectedSubscriptionBeforeDiscount &&
      prices.finalMainPrice === expectedFinalMain &&
      prices.finalSubscriptionPrice === expectedFinalSubscription;

    return {
      isValid,
      input: basePriceCents,
      calculated: prices,
      expected: {
        subscriptionBeforeDiscount: expectedSubscriptionBeforeDiscount,
        finalMainPrice: expectedFinalMain,
        finalSubscriptionPrice: expectedFinalSubscription
      },
      formulas: {
        subscriptionDiscount: '25% off base price',
        sitewideDiscount: '20% off all prices',
        finalSubscription: 'base * 0.75 * 0.80 = base * 0.60'
      }
    };
  }
}
