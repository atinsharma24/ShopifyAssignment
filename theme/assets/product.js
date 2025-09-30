"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProductManager = void 0;
var _variantManager = require("./ui/variant-manager");
var _pricing = require("./ui/pricing");
var _mediaGallery = require("./ui/media-gallery");
var _cartApi = require("./ui/cart-api");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * Product Page Main TypeScript Module
 * 
 * This file orchestrates all product page functionality including:
 * - Variant selection and mapping
 * - Price calculations and display updates
 * - Media gallery interactions
 * - Cart API integration
 * - Form validation and error handling
 */
/**
 * Main Product Manager Class
 * Coordinates all product page functionality
 */
var ProductManager = exports.ProductManager = /*#__PURE__*/function () {
  function ProductManager(productData) {
    _classCallCheck(this, ProductManager);
    this.productData = productData;
    this.variantManager = new _variantManager.VariantManager(productData);
    this.pricingManager = new _pricing.PricingManager();
    this.mediaGallery = new _mediaGallery.MediaGallery();
    this.cartAPI = new _cartApi.CartAPI();

    // State management
    this.currentState = {
      purchaseMode: 'single',
      flavors: {
        single: 'Chocolate',
        1: 'Chocolate',
        2: 'Vanilla'
      },
      selectedVariant: null,
      isLoading: false
    };

    // Initialize elements object
    this.elements = {};
  }

  /**
   * Initialize the product page
   */
  return _createClass(ProductManager, [{
    key: "init",
    value: function init() {
      this.cacheElements();
      this.bindEvents();
      this.setInitialState();
      this.updateDisplay();
      console.log('Product page initialized', this.productData);
    }

    /**
     * Cache frequently used DOM elements
     */
  }, {
    key: "cacheElements",
    value: function cacheElements() {
      this.elements = {
        // Mode selection
        modeRadios: document.querySelectorAll('input[name="purchase_mode"]'),
        // Flavor selectors
        singleFlavorSelector: document.querySelector('.flavor-selector.single-flavor'),
        doubleFlavorSelector: document.querySelector('.flavor-selector.double-flavor'),
        flavorInputs: document.querySelectorAll('.flavor-input'),
        // Price display
        priceDisplay: document.querySelector('[data-price-display]'),
        mainPrice: document.querySelector('[data-main-price]'),
        subscriptionPrice: document.querySelector('[data-subscription-price]'),
        // What's included
        includedSingle: document.querySelector('.included-single'),
        includedDouble: document.querySelector('.included-double'),
        // Form elements
        variantIdInput: document.getElementById('variant-id'),
        addToCartBtn: document.querySelector('[data-add-to-cart]'),
        productForm: document.querySelector('.product-form'),
        // Error/success messages
        errorMessage: document.getElementById('cart-errors'),
        successMessage: document.getElementById('cart-success')
      };
    }

    /**
     * Bind event listeners
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;
      // Purchase mode change
      this.elements.modeRadios.forEach(function (radio) {
        radio.addEventListener('change', _this.handleModeChange.bind(_this));
      });

      // Flavor selection change
      this.elements.flavorInputs.forEach(function (input) {
        input.addEventListener('change', _this.handleFlavorChange.bind(_this));
      });

      // Add to cart
      if (this.elements.addToCartBtn) {
        this.elements.addToCartBtn.addEventListener('click', this.handleAddToCart.bind(this));
      }

      // Form submission
      if (this.elements.productForm) {
        this.elements.productForm.addEventListener('submit', this.handleFormSubmit.bind(this));
      }
    }

    /**
     * Set initial state based on URL parameters or defaults
     */
  }, {
    key: "setInitialState",
    value: function setInitialState() {
      var urlParams = new URLSearchParams(window.location.search);

      // Set mode from URL or default
      var mode = urlParams.get('mode') || 'single';
      this.currentState.purchaseMode = mode;

      // Set flavors from URL or defaults
      if (mode === 'single') {
        this.currentState.flavors.single = urlParams.get('flavor') || 'Chocolate';
      } else {
        this.currentState.flavors[1] = urlParams.get('flavor1') || 'Chocolate';
        this.currentState.flavors[2] = urlParams.get('flavor2') || 'Vanilla';
      }

      // Find and set initial variant
      this.updateSelectedVariant();
    }

    /**
     * Handle purchase mode change
     */
  }, {
    key: "handleModeChange",
    value: function handleModeChange(event) {
      var target = event.target;
      var newMode = target.value;
      if (newMode !== this.currentState.purchaseMode) {
        this.currentState.purchaseMode = newMode;
        this.updateDisplay();
        this.updateSelectedVariant();
      }
    }

    /**
     * Handle flavor selection change
     */
  }, {
    key: "handleFlavorChange",
    value: function handleFlavorChange(event) {
      var target = event.target;
      var flavorType = target.dataset.flavorType;
      var flavorValue = target.value;
      if (flavorType === 'single') {
        this.currentState.flavors.single = flavorValue;
      } else if (flavorType === 'double-1') {
        this.currentState.flavors[1] = flavorValue;
      } else if (flavorType === 'double-2') {
        this.currentState.flavors[2] = flavorValue;
      }
      this.updateSelectedVariant();
      this.updatePricing();
    }

    /**
     * Handle add to cart button click
     */
  }, {
    key: "handleAddToCart",
    value: (function () {
      var _handleAddToCart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(event) {
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              event.preventDefault();
              if (this.currentState.selectedVariant) {
                _context.n = 1;
                break;
              }
              this.showError('Please select a valid product variant');
              return _context.a(2);
            case 1:
              _context.n = 2;
              return this.addToCart();
            case 2:
              return _context.a(2);
          }
        }, _callee, this);
      }));
      function handleAddToCart(_x) {
        return _handleAddToCart.apply(this, arguments);
      }
      return handleAddToCart;
    }()
    /**
     * Handle form submission
     */
    )
  }, {
    key: "handleFormSubmit",
    value: (function () {
      var _handleFormSubmit = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(event) {
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              event.preventDefault();
              _context2.n = 1;
              return this.addToCart();
            case 1:
              return _context2.a(2);
          }
        }, _callee2, this);
      }));
      function handleFormSubmit(_x2) {
        return _handleFormSubmit.apply(this, arguments);
      }
      return handleFormSubmit;
    }()
    /**
     * Update selected variant based on current state
     */
    )
  }, {
    key: "updateSelectedVariant",
    value: function updateSelectedVariant() {
      var selections = this.getCurrentSelections();
      var variant = this.variantManager.findVariant(selections);
      this.currentState.selectedVariant = variant;

      // Update variant ID in form
      if (this.elements.variantIdInput && variant) {
        this.elements.variantIdInput.value = variant.id.toString();
      }
      this.updateAddToCartButton();
    }

    /**
     * Get current selections based on state
     */
  }, {
    key: "getCurrentSelections",
    value: function getCurrentSelections() {
      if (this.currentState.purchaseMode === 'single') {
        return {
          mode: 'single',
          flavor: this.currentState.flavors.single
        };
      } else {
        return {
          mode: 'double',
          flavor1: this.currentState.flavors[1],
          flavor2: this.currentState.flavors[2]
        };
      }
    }

    /**
     * Update all display elements
     */
  }, {
    key: "updateDisplay",
    value: function updateDisplay() {
      this.updateModeDisplay();
      this.updateFlavorDisplay();
      this.updatePricing();
      this.updateIncludedItems();
      this.updateAddToCartButton();
    }

    /**
     * Update mode display
     */
  }, {
    key: "updateModeDisplay",
    value: function updateModeDisplay() {
      var _this2 = this;
      this.elements.modeRadios.forEach(function (radio) {
        radio.checked = radio.value === _this2.currentState.purchaseMode;
      });
    }

    /**
     * Update flavor display
     */
  }, {
    key: "updateFlavorDisplay",
    value: function updateFlavorDisplay() {
      var _this3 = this;
      // Show/hide appropriate flavor selectors
      if (this.elements.singleFlavorSelector) {
        this.elements.singleFlavorSelector.style.display = this.currentState.purchaseMode === 'single' ? 'block' : 'none';
      }
      if (this.elements.doubleFlavorSelector) {
        this.elements.doubleFlavorSelector.style.display = this.currentState.purchaseMode === 'double' ? 'block' : 'none';
      }

      // Update selected flavor inputs
      this.elements.flavorInputs.forEach(function (input) {
        var flavorType = input.dataset.flavorType;
        if (flavorType === 'single') {
          input.checked = input.value === _this3.currentState.flavors.single;
        } else if (flavorType === 'double-1') {
          input.checked = input.value === _this3.currentState.flavors[1];
        } else if (flavorType === 'double-2') {
          input.checked = input.value === _this3.currentState.flavors[2];
        }
      });
    }

    /**
     * Update pricing display
     */
  }, {
    key: "updatePricing",
    value: function updatePricing() {
      if (!this.currentState.selectedVariant) return;
      var variant = this.currentState.selectedVariant;
      var prices = this.pricingManager.calculatePrices(variant.price || 0);
      this.pricingManager.updateDisplay(prices, this.currentState.purchaseMode);
    }

    /**
     * Update included items display
     */
  }, {
    key: "updateIncludedItems",
    value: function updateIncludedItems() {
      if (this.elements.includedSingle) {
        this.elements.includedSingle.style.display = this.currentState.purchaseMode === 'single' ? 'block' : 'none';
      }
      if (this.elements.includedDouble) {
        this.elements.includedDouble.style.display = this.currentState.purchaseMode === 'double' ? 'block' : 'none';
      }
    }

    /**
     * Update add to cart button state
     */
  }, {
    key: "updateAddToCartButton",
    value: function updateAddToCartButton() {
      var _this$currentState$se;
      if (!this.elements.addToCartBtn) return;
      var isValid = this.validateCurrentSelection();
      var isAvailable = ((_this$currentState$se = this.currentState.selectedVariant) === null || _this$currentState$se === void 0 ? void 0 : _this$currentState$se.available) === true;
      this.elements.addToCartBtn.classList.toggle('disabled', !isValid || !isAvailable);
      if (this.elements.addToCartBtn instanceof HTMLButtonElement) {
        this.elements.addToCartBtn.disabled = !isValid || !isAvailable;
      }
    }

    /**
     * Validate current selection
     */
  }, {
    key: "validateCurrentSelection",
    value: function validateCurrentSelection() {
      var selections = this.getCurrentSelections();
      var validation = this.variantManager.validateSelections(selections);
      return validation.isValid;
    }

    /**
     * Add product to cart
     */
  }, {
    key: "addToCart",
    value: (function () {
      var _addToCart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
        var _t;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              if (this.currentState.selectedVariant) {
                _context3.n = 1;
                break;
              }
              this.showError('Please select a valid product variant');
              return _context3.a(2);
            case 1:
              this.setLoading(true);
              this.clearMessages();
              _context3.p = 2;
              _context3.n = 3;
              return this.cartAPI.addToCart({
                id: this.currentState.selectedVariant.id,
                quantity: 1
              });
            case 3:
              this.showSuccess('Product added to cart successfully!');
              _context3.n = 5;
              break;
            case 4:
              _context3.p = 4;
              _t = _context3.v;
              console.error('Add to cart error:', _t);
              this.showError('Failed to add product to cart. Please try again.');
            case 5:
              _context3.p = 5;
              this.setLoading(false);
              return _context3.f(5);
            case 6:
              return _context3.a(2);
          }
        }, _callee3, this, [[2, 4, 5, 6]]);
      }));
      function addToCart() {
        return _addToCart.apply(this, arguments);
      }
      return addToCart;
    }()
    /**
     * Set loading state
     */
    )
  }, {
    key: "setLoading",
    value: function setLoading(loading) {
      this.currentState.isLoading = loading;
      if (this.elements.addToCartBtn) {
        this.elements.addToCartBtn.classList.toggle('loading', loading);
      }
    }

    /**
     * Show error message
     */
  }, {
    key: "showError",
    value: function showError(message) {
      if (this.elements.errorMessage) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
      }
    }

    /**
     * Show success message
     */
  }, {
    key: "showSuccess",
    value: function showSuccess(message) {
      if (this.elements.successMessage) {
        this.elements.successMessage.textContent = message;
        this.elements.successMessage.style.display = 'block';
      }
    }

    /**
     * Clear all messages
     */
  }, {
    key: "clearMessages",
    value: function clearMessages() {
      if (this.elements.errorMessage) {
        this.elements.errorMessage.style.display = 'none';
      }
      if (this.elements.successMessage) {
        this.elements.successMessage.style.display = 'none';
      }
    }

    /**
     * Get current state (for debugging/testing)
     */
  }, {
    key: "getCurrentState",
    value: function getCurrentState() {
      return _objectSpread({}, this.currentState);
    }

    /**
     * Get current variant (for debugging/testing)
     */
  }, {
    key: "getCurrentVariant",
    value: function getCurrentVariant() {
      return this.currentState.selectedVariant;
    }
  }]);
}(); // Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  var productDataElement = document.querySelector('[data-product]');
  if (productDataElement) {
    try {
      var productData = JSON.parse(productDataElement.textContent || '{}');
      var productManager = new ProductManager(productData);
      productManager.init();

      // Make available globally for debugging
      window.productManager = productManager;
    } catch (error) {
      console.error('Failed to initialize product page:', error);
    }
  }
});