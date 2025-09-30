export interface FormatMoneyOptions {
  currency?: string;
  format?: string | null;
  showDecimals?: boolean;
}

type ExchangeRatesMap = Record<string, number>;

const DEFAULT_CURRENCY = 'USD';

/**
 * Format money amount for display.
 */
export function formatMoney(cents: number, options: FormatMoneyOptions = {}): string {
  const {
    currency = DEFAULT_CURRENCY,
    format = null,
    showDecimals = true
  } = options;

  if (typeof cents !== 'number' || Number.isNaN(cents)) {
    return '$0.00';
  }

  const amount = cents / 100;

  if (format) {
    return formatWithCustomFormat(amount, format);
  }

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });

    return formatter.format(amount);
  } catch (error) {
    console.warn('Currency formatting error:', error);
    return fallbackFormat(amount, currency, showDecimals);
  }
}

function formatWithCustomFormat(amount: number, format: string): string {
  const formattedAmount = amount.toFixed(2);
  return format.replace(/\{\{amount\}\}/g, formattedAmount);
}

function fallbackFormat(amount: number, currency: string, showDecimals: boolean): string {
  const decimals = showDecimals ? 2 : 0;
  const formatted = amount.toFixed(decimals);

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥'
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${formatted}`;
}

/**
 * Parse money string to cents.
 */
export function parseMoney(moneyString: string): number {
  if (typeof moneyString !== 'string') {
    return 0;
  }

  const cleanString = moneyString.replace(/[^\d.-]/g, '');
  const amount = Number.parseFloat(cleanString);

  if (Number.isNaN(amount)) {
    return 0;
  }

  return Math.round(amount * 100);
}

/**
 * Calculate percentage discount.
 */
export function calculateDiscountPercent(originalCents: number, saleCents: number): number {
  if (originalCents <= 0 || saleCents >= originalCents) {
    return 0;
  }

  const discount = ((originalCents - saleCents) / originalCents) * 100;
  return Math.round(discount);
}

/**
 * Calculate savings amount.
 */
export function calculateSavings(originalCents: number, saleCents: number): number {
  return Math.max(0, originalCents - saleCents);
}

/**
 * Convert money between currencies.
 */
export function convertCurrency(
  cents: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: ExchangeRatesMap = {}
): number {
  if (fromCurrency === toCurrency) {
    return cents;
  }

  const rate = exchangeRates[`${fromCurrency}_${toCurrency}`];
  if (rate === undefined) {
    console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
    return cents;
  }

  return Math.round(cents * rate);
}

/**
 * Format price range for variants.
 */
export function formatPriceRange(prices: number[], options: FormatMoneyOptions = {}): string {
  if (!Array.isArray(prices) || prices.length === 0) {
    return formatMoney(0, options);
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    return formatMoney(minPrice, options);
  }

  return `${formatMoney(minPrice, options)} - ${formatMoney(maxPrice, options)}`;
}

/**
 * Add money amounts safely (avoiding floating point issues).
 */
export function addAmounts(...amounts: Array<number | null | undefined>): number {
  return amounts.reduce((sum: number, amount) => {
    const cents = amount || 0;
    return sum + cents;
  }, 0);
}

/**
 * Multiply money amount by quantity.
 */
export function multiplyMoney(priceCents: number, quantity: number): number {
  if (typeof priceCents !== 'number' || typeof quantity !== 'number') {
    return 0;
  }

  return Math.round(priceCents * quantity);
}

/**
 * Apply discount to money amount.
 */
export function applyDiscount(originalCents: number, discountPercent: number): number {
  if (discountPercent <= 0 || discountPercent >= 100) {
    return originalCents;
  }

  const discountMultiplier = (100 - discountPercent) / 100;
  return Math.round(originalCents * discountMultiplier);
}

/**
 * Round money to nearest cent.
 */
export function roundMoney(amount: number): number {
  return Math.round(amount);
}

/**
 * Check if amount is valid money value.
 */
export function isValidMoney(amount: unknown): amount is number {
  return (
    typeof amount === 'number' &&
    !Number.isNaN(amount) &&
    Number.isFinite(amount) &&
    amount >= 0
  );
}

/**
 * Get currency symbol for currency code.
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    KRW: '₩',
    BRL: 'R$',
    MXN: '$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft'
  };

  return symbols[currencyCode] || currencyCode;
}

/**
 * Format money for specific regions/locales.
 */
export function formatMoneyLocale(
  cents: number,
  locale = 'en-US',
  currency = DEFAULT_CURRENCY
): string {
  const amount = cents / 100;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    });

    return formatter.format(amount);
  } catch (error) {
    console.warn('Locale formatting error:', error);
    return formatMoney(cents, { currency });
  }
}
