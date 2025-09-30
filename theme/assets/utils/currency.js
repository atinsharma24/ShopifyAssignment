"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addAmounts = addAmounts;
exports.applyDiscount = applyDiscount;
exports.calculateDiscountPercent = calculateDiscountPercent;
exports.calculateSavings = calculateSavings;
exports.convertCurrency = convertCurrency;
exports.formatMoney = formatMoney;
exports.formatMoneyLocale = formatMoneyLocale;
exports.formatPriceRange = formatPriceRange;
exports.getCurrencySymbol = getCurrencySymbol;
exports.isValidMoney = isValidMoney;
exports.multiplyMoney = multiplyMoney;
exports.parseMoney = parseMoney;
exports.roundMoney = roundMoney;
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var DEFAULT_CURRENCY = 'USD';

/**
 * Format money amount for display.
 */
function formatMoney(cents) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$currency = options.currency,
    currency = _options$currency === void 0 ? DEFAULT_CURRENCY : _options$currency,
    _options$format = options.format,
    format = _options$format === void 0 ? null : _options$format,
    _options$showDecimals = options.showDecimals,
    showDecimals = _options$showDecimals === void 0 ? true : _options$showDecimals;
  if (typeof cents !== 'number' || Number.isNaN(cents)) {
    return '$0.00';
  }
  var amount = cents / 100;
  if (format) {
    return formatWithCustomFormat(amount, format);
  }
  try {
    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });
    return formatter.format(amount);
  } catch (error) {
    console.warn('Currency formatting error:', error);
    return fallbackFormat(amount, currency, showDecimals);
  }
}
function formatWithCustomFormat(amount, format) {
  var formattedAmount = amount.toFixed(2);
  return format.replace(/\{\{amount\}\}/g, formattedAmount);
}
function fallbackFormat(amount, currency, showDecimals) {
  var decimals = showDecimals ? 2 : 0;
  var formatted = amount.toFixed(decimals);
  var symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥'
  };
  var symbol = symbols[currency] || currency;
  return "".concat(symbol).concat(formatted);
}

/**
 * Parse money string to cents.
 */
function parseMoney(moneyString) {
  if (typeof moneyString !== 'string') {
    return 0;
  }
  var cleanString = moneyString.replace(/[^\d.-]/g, '');
  var amount = Number.parseFloat(cleanString);
  if (Number.isNaN(amount)) {
    return 0;
  }
  return Math.round(amount * 100);
}

/**
 * Calculate percentage discount.
 */
function calculateDiscountPercent(originalCents, saleCents) {
  if (originalCents <= 0 || saleCents >= originalCents) {
    return 0;
  }
  var discount = (originalCents - saleCents) / originalCents * 100;
  return Math.round(discount);
}

/**
 * Calculate savings amount.
 */
function calculateSavings(originalCents, saleCents) {
  return Math.max(0, originalCents - saleCents);
}

/**
 * Convert money between currencies.
 */
function convertCurrency(cents, fromCurrency, toCurrency) {
  var exchangeRates = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  if (fromCurrency === toCurrency) {
    return cents;
  }
  var rate = exchangeRates["".concat(fromCurrency, "_").concat(toCurrency)];
  if (rate === undefined) {
    console.warn("No exchange rate found for ".concat(fromCurrency, " to ").concat(toCurrency));
    return cents;
  }
  return Math.round(cents * rate);
}

/**
 * Format price range for variants.
 */
function formatPriceRange(prices) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (!Array.isArray(prices) || prices.length === 0) {
    return formatMoney(0, options);
  }
  var minPrice = Math.min.apply(Math, _toConsumableArray(prices));
  var maxPrice = Math.max.apply(Math, _toConsumableArray(prices));
  if (minPrice === maxPrice) {
    return formatMoney(minPrice, options);
  }
  return "".concat(formatMoney(minPrice, options), " - ").concat(formatMoney(maxPrice, options));
}

/**
 * Add money amounts safely (avoiding floating point issues).
 */
function addAmounts() {
  for (var _len = arguments.length, amounts = new Array(_len), _key = 0; _key < _len; _key++) {
    amounts[_key] = arguments[_key];
  }
  return amounts.reduce(function (sum, amount) {
    var cents = amount || 0;
    return sum + cents;
  }, 0);
}

/**
 * Multiply money amount by quantity.
 */
function multiplyMoney(priceCents, quantity) {
  if (typeof priceCents !== 'number' || typeof quantity !== 'number') {
    return 0;
  }
  return Math.round(priceCents * quantity);
}

/**
 * Apply discount to money amount.
 */
function applyDiscount(originalCents, discountPercent) {
  if (discountPercent <= 0 || discountPercent >= 100) {
    return originalCents;
  }
  var discountMultiplier = (100 - discountPercent) / 100;
  return Math.round(originalCents * discountMultiplier);
}

/**
 * Round money to nearest cent.
 */
function roundMoney(amount) {
  return Math.round(amount);
}

/**
 * Check if amount is valid money value.
 */
function isValidMoney(amount) {
  return typeof amount === 'number' && !Number.isNaN(amount) && Number.isFinite(amount) && amount >= 0;
}

/**
 * Get currency symbol for currency code.
 */
function getCurrencySymbol(currencyCode) {
  var symbols = {
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
function formatMoneyLocale(cents) {
  var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en-US';
  var currency = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_CURRENCY;
  var amount = cents / 100;
  try {
    var formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount);
  } catch (error) {
    console.warn('Locale formatting error:', error);
    return formatMoney(cents, {
      currency: currency
    });
  }
}