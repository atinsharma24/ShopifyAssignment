"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PricingManager = void 0;
var _currency = require("../utils/currency");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var PricingManager = exports.PricingManager = /*#__PURE__*/function () {
  function PricingManager() {
    _classCallCheck(this, PricingManager);
    _defineProperty(this, "SUBSCRIPTION_DISCOUNT", 0.25);
    _defineProperty(this, "SITEWIDE_DISCOUNT", 0.2);
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
  return _createClass(PricingManager, [{
    key: "cacheElements",
    value: function cacheElements() {
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
  }, {
    key: "calculatePrices",
    value: function calculatePrices(basePriceCents) {
      var basePrice = Math.round(basePriceCents);
      var subscriptionBeforeDiscount = Math.round(basePrice * (1 - this.SUBSCRIPTION_DISCOUNT));
      var finalMainPrice = Math.round(basePrice * (1 - this.SITEWIDE_DISCOUNT));
      var finalSubscriptionPrice = Math.round(subscriptionBeforeDiscount * (1 - this.SITEWIDE_DISCOUNT));
      var mainSavings = basePrice - finalMainPrice;
      var subscriptionSavings = basePrice - finalSubscriptionPrice;
      return {
        basePrice: basePrice,
        mainBeforeDiscount: basePrice,
        subscriptionBeforeDiscount: subscriptionBeforeDiscount,
        finalMainPrice: finalMainPrice,
        finalSubscriptionPrice: finalSubscriptionPrice,
        mainSavings: mainSavings,
        subscriptionSavings: subscriptionSavings,
        subscriptionDiscountPercent: this.SUBSCRIPTION_DISCOUNT * 100,
        sitewideDiscountPercent: this.SITEWIDE_DISCOUNT * 100,
        totalSubscriptionDiscountPercent: basePrice === 0 ? 0 : (basePrice - finalSubscriptionPrice) / basePrice * 100
      };
    }
  }, {
    key: "updateDisplay",
    value: function updateDisplay(prices) {
      var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'single';
      this.updateMainPricing(prices, mode);
      this.updateSubscriptionPricing(prices, mode);
      this.updatePerServingPricing(prices, mode);
      this.updatePriceBreakdown(prices);
      console.log('Pricing updated:', prices, 'Mode:', mode);
    }
  }, {
    key: "updateMainPricing",
    value: function updateMainPricing(prices, mode) {
      var _this$elements = this.elements,
        mainPrice = _this$elements.mainPrice,
        mainOriginal = _this$elements.mainOriginal,
        mainSavings = _this$elements.mainSavings;
      if (mainPrice) {
        var displayPrice = mode === 'double' ? prices.finalMainPrice * 2 : prices.finalMainPrice;
        mainPrice.textContent = (0, _currency.formatMoney)(displayPrice);
      }
      if (mainOriginal) {
        var originalPrice = mode === 'double' ? prices.basePrice * 2 : prices.basePrice;
        if (prices.mainSavings > 0) {
          mainOriginal.textContent = (0, _currency.formatMoney)(originalPrice);
          mainOriginal.style.display = 'inline';
        } else {
          mainOriginal.style.display = 'none';
        }
      }
      if (mainSavings) {
        var savingsAmount = mode === 'double' ? prices.mainSavings * 2 : prices.mainSavings;
        var savingsAmountElement = mainSavings.querySelector('.savings-amount');
        if (savingsAmount > 0 && savingsAmountElement) {
          savingsAmountElement.textContent = (0, _currency.formatMoney)(savingsAmount);
          mainSavings.style.display = 'block';
        } else {
          mainSavings.style.display = 'none';
        }
      }
    }
  }, {
    key: "updateSubscriptionPricing",
    value: function updateSubscriptionPricing(prices, mode) {
      var _this$elements2 = this.elements,
        subscriptionPrice = _this$elements2.subscriptionPrice,
        subscriptionOriginal = _this$elements2.subscriptionOriginal,
        subscriptionSavings = _this$elements2.subscriptionSavings;
      if (subscriptionPrice) {
        var displayPrice = mode === 'double' ? prices.finalSubscriptionPrice * 2 : prices.finalSubscriptionPrice;
        subscriptionPrice.textContent = (0, _currency.formatMoney)(displayPrice);
      }
      if (subscriptionOriginal) {
        var originalPrice = mode === 'double' ? prices.basePrice * 2 : prices.basePrice;
        subscriptionOriginal.textContent = (0, _currency.formatMoney)(originalPrice);
      }
      if (subscriptionSavings) {
        var savingsAmount = mode === 'double' ? prices.subscriptionSavings * 2 : prices.subscriptionSavings;
        var savingsAmountElement = subscriptionSavings.querySelector('.savings-amount');
        if (savingsAmountElement) {
          savingsAmountElement.textContent = (0, _currency.formatMoney)(savingsAmount);
        }
      }
    }
  }, {
    key: "updatePerServingPricing",
    value: function updatePerServingPricing(prices, mode) {
      var _this$elements3 = this.elements,
        perServingPrice = _this$elements3.perServingPrice,
        perServingSection = _this$elements3.perServingSection;
      if (!perServingSection) {
        return;
      }
      if (mode === 'double') {
        if (perServingPrice) {
          perServingPrice.textContent = (0, _currency.formatMoney)(prices.finalSubscriptionPrice);
        }
        perServingSection.style.display = 'block';
        return;
      }
      perServingSection.style.display = 'none';
    }
  }, {
    key: "updatePriceBreakdown",
    value: function updatePriceBreakdown(prices) {
      var _this$elements4 = this.elements,
        breakdownBase = _this$elements4.breakdownBase,
        breakdownSubscription = _this$elements4.breakdownSubscription,
        breakdownSitewide = _this$elements4.breakdownSitewide,
        breakdownFinal = _this$elements4.breakdownFinal;
      if (breakdownBase) {
        breakdownBase.textContent = (0, _currency.formatMoney)(prices.basePrice);
      }
      if (breakdownSubscription) {
        var subscriptionDiscount = prices.basePrice - prices.subscriptionBeforeDiscount;
        breakdownSubscription.textContent = "-".concat((0, _currency.formatMoney)(subscriptionDiscount));
      }
      if (breakdownSitewide) {
        var sitewideDiscount = Math.round(prices.subscriptionBeforeDiscount * this.SITEWIDE_DISCOUNT);
        breakdownSitewide.textContent = "-".concat((0, _currency.formatMoney)(sitewideDiscount));
      }
      if (breakdownFinal) {
        breakdownFinal.textContent = (0, _currency.formatMoney)(prices.finalSubscriptionPrice);
      }
    }
  }, {
    key: "calculateMultipleItemsPricing",
    value: function calculateMultipleItemsPricing(basePriceCents) {
      var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      var singlePrices = this.calculatePrices(basePriceCents);
      return _objectSpread(_objectSpread({}, singlePrices), {}, {
        finalMainPrice: singlePrices.finalMainPrice * quantity,
        finalSubscriptionPrice: singlePrices.finalSubscriptionPrice * quantity,
        mainSavings: singlePrices.mainSavings * quantity,
        subscriptionSavings: singlePrices.subscriptionSavings * quantity,
        basePrice: singlePrices.basePrice * quantity,
        perItemFinalMain: singlePrices.finalMainPrice,
        perItemFinalSubscription: singlePrices.finalSubscriptionPrice
      });
    }
  }, {
    key: "getFormattedPrice",
    value: function getFormattedPrice(priceCents) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return (0, _currency.formatMoney)(priceCents, options);
    }
  }, {
    key: "calculateDiscountPercentage",
    value: function calculateDiscountPercentage(originalPrice, salePrice) {
      if (originalPrice <= 0) {
        return 0;
      }
      return Math.round((originalPrice - salePrice) / originalPrice * 100);
    }
  }, {
    key: "validatePricing",
    value: function validatePricing(basePriceCents) {
      var prices = this.calculatePrices(basePriceCents);
      var expectedSubscriptionBeforeDiscount = Math.round(basePriceCents * 0.75);
      var expectedFinalMain = Math.round(basePriceCents * 0.8);
      var expectedFinalSubscription = Math.round(basePriceCents * 0.6);
      var isValid = prices.subscriptionBeforeDiscount === expectedSubscriptionBeforeDiscount && prices.finalMainPrice === expectedFinalMain && prices.finalSubscriptionPrice === expectedFinalSubscription;
      return {
        isValid: isValid,
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
  }]);
}();