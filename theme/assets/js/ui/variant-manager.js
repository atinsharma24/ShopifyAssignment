"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VariantManager = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Variant Manager Module
 * 
 * Handles mapping of user selections to Shopify product variants
 * Manages variant availability and selection logic
 */
var VariantManager = exports.VariantManager = /*#__PURE__*/function () {
  function VariantManager(productData) {
    _classCallCheck(this, VariantManager);
    this.product = productData;
    this.variants = productData.variants || [];
    console.log('VariantManager initialized with', this.variants.length, 'variants');
  }

  /**
   * Find variant based on current selections
   * @param {Object} selections - Current user selections
   * @param {string} selections.mode - 'single' or 'double'
   * @param {string} selections.flavor - For single mode
   * @param {string} selections.flavor1 - For double mode
   * @param {string} selections.flavor2 - For double mode
   * @returns {Object|null} - Matching variant or null
   */
  return _createClass(VariantManager, [{
    key: "findVariant",
    value: function findVariant(selections) {
      var _this = this;
      if (!selections) return null;

      // Create search criteria based on mode
      var searchCriteria = this.createSearchCriteria(selections);

      // Find matching variant
      var variant = this.variants.find(function (variant) {
        return _this.matchesVariant(variant, searchCriteria);
      });
      if (!variant) {
        console.warn('No variant found for selections:', selections);
        return null;
      }
      console.log('Found variant:', variant.id, 'for selections:', selections);
      return variant;
    }

    /**
     * Create search criteria based on selections
     * @param {Object} selections - User selections
     * @returns {Object} - Search criteria for variant matching
     */
  }, {
    key: "createSearchCriteria",
    value: function createSearchCriteria(selections) {
      var mode = selections.mode;
      if (mode === 'single') {
        return {
          mode: 'Single',
          flavor: selections.flavor,
          type: 'subscription' // Default to subscription
        };
      } else if (mode === 'double') {
        return {
          mode: 'Double',
          flavor1: selections.flavor1,
          flavor2: selections.flavor2,
          type: 'subscription'
        };
      }
      return {};
    }

    /**
     * Check if variant matches search criteria
     * @param {Object} variant - Shopify variant object
     * @param {Object} criteria - Search criteria
     * @returns {boolean} - Whether variant matches
     */
  }, {
    key: "matchesVariant",
    value: function matchesVariant(variant, criteria) {
      // Validate inputs
      if (!variant || !criteria) return false;

      // Check variant title and options for matches
      var title = (variant.title || '').toLowerCase();
      var options = variant.options ? variant.options.map(function (opt) {
        return (opt || '').toLowerCase();
      }) : [];

      // For single mode: look for mode + flavor combination
      if (criteria.mode === 'Single') {
        if (!criteria.flavor) return false;
        var hasMode = title.includes('single') || options.some(function (opt) {
          return opt.includes('single');
        });
        var hasFlavor = title.includes(criteria.flavor.toLowerCase()) || options.some(function (opt) {
          return opt.includes(criteria.flavor.toLowerCase());
        });
        return hasMode && hasFlavor;
      }

      // For double mode: look for mode + both flavors
      if (criteria.mode === 'Double') {
        if (!criteria.flavor1 || !criteria.flavor2) return false;
        var _hasMode = title.includes('double') || options.some(function (opt) {
          return opt.includes('double');
        });
        var hasFlavor1 = title.includes(criteria.flavor1.toLowerCase()) || options.some(function (opt) {
          return opt.includes(criteria.flavor1.toLowerCase());
        });
        var hasFlavor2 = title.includes(criteria.flavor2.toLowerCase()) || options.some(function (opt) {
          return opt.includes(criteria.flavor2.toLowerCase());
        });
        return _hasMode && hasFlavor1 && hasFlavor2;
      }
      return false;
    }

    /**
     * Get all available flavors for a specific mode
     * @param {string} mode - 'single' or 'double'
     * @returns {Array} - Array of available flavor names
     */
  }, {
    key: "getAvailableFlavors",
    value: function getAvailableFlavors() {
      var _this2 = this;
      var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'single';
      var flavors = new Set();
      this.variants.forEach(function (variant) {
        if (_this2.variantHasMode(variant, mode)) {
          var extractedFlavors = _this2.extractFlavorsFromVariant(variant);
          extractedFlavors.forEach(function (flavor) {
            return flavors.add(flavor);
          });
        }
      });
      return Array.from(flavors);
    }

    /**
     * Check if variant belongs to a specific mode
     * @param {Object} variant - Shopify variant
     * @param {string} mode - Mode to check
     * @returns {boolean}
     */
  }, {
    key: "variantHasMode",
    value: function variantHasMode(variant, mode) {
      var title = variant.title.toLowerCase();
      var options = variant.options ? variant.options.map(function (opt) {
        return opt.toLowerCase();
      }) : [];
      var modeString = mode.toLowerCase();
      return title.includes(modeString) || options.some(function (opt) {
        return opt.includes(modeString);
      });
    }

    /**
     * Extract flavor names from variant
     * @param {Object} variant - Shopify variant
     * @returns {Array} - Array of flavor names
     */
  }, {
    key: "extractFlavorsFromVariant",
    value: function extractFlavorsFromVariant(variant) {
      var knownFlavors = ['chocolate', 'vanilla', 'orange'];
      var flavors = [];
      var title = variant.title.toLowerCase();
      var options = variant.options ? variant.options.map(function (opt) {
        return opt.toLowerCase();
      }) : [];
      var searchText = [title].concat(_toConsumableArray(options)).join(' ');
      knownFlavors.forEach(function (flavor) {
        if (searchText.includes(flavor)) {
          flavors.push(flavor.charAt(0).toUpperCase() + flavor.slice(1));
        }
      });
      return flavors;
    }

    /**
     * Check if variant is available for purchase
     * @param {Object} variant - Shopify variant
     * @returns {boolean}
     */
  }, {
    key: "isVariantAvailable",
    value: function isVariantAvailable(variant) {
      if (!variant) return false;
      return variant.available !== false && variant.inventory_quantity !== 0;
    }

    /**
     * Get variant by ID
     * @param {number|string} variantId - Variant ID
     * @returns {Object|null}
     */
  }, {
    key: "getVariantById",
    value: function getVariantById(variantId) {
      return this.variants.find(function (variant) {
        return variant.id == variantId;
      }) || null;
    }

    /**
     * Get default variant (first available or first variant)
     * @returns {Object|null}
     */
  }, {
    key: "getDefaultVariant",
    value: function getDefaultVariant() {
      var _this3 = this;
      // Try to find first available variant
      var availableVariant = this.variants.find(function (variant) {
        return _this3.isVariantAvailable(variant);
      });

      // Fallback to first variant
      return availableVariant || this.variants[0] || null;
    }

    /**
     * Generate all possible selection combinations for testing
     * @returns {Array} - Array of selection objects
     */
  }, {
    key: "generateAllCombinations",
    value: function generateAllCombinations() {
      var flavors = ['Chocolate', 'Vanilla', 'Orange'];
      var combinations = [];

      // Single mode combinations
      flavors.forEach(function (flavor) {
        combinations.push({
          mode: 'single',
          flavor: flavor
        });
      });

      // Double mode combinations
      flavors.forEach(function (flavor1) {
        flavors.forEach(function (flavor2) {
          combinations.push({
            mode: 'double',
            flavor1: flavor1,
            flavor2: flavor2
          });
        });
      });
      return combinations;
    }

    /**
     * Validate current selections
     * @param {Object} selections - Current selections
     * @returns {Object} - Validation result with isValid and errors
     */
  }, {
    key: "validateSelections",
    value: function validateSelections(selections) {
      var errors = [];
      if (!selections.mode) {
        errors.push('Purchase mode is required');
      }
      if (selections.mode === 'single' && !selections.flavor) {
        errors.push('Flavor selection is required for single mode');
      }
      if (selections.mode === 'double') {
        if (!selections.flavor1) {
          errors.push('First flavor selection is required for double mode');
        }
        if (!selections.flavor2) {
          errors.push('Second flavor selection is required for double mode');
        }
      }
      var variant = this.findVariant(selections);
      if (!variant) {
        errors.push('No product variant available for selected options');
      } else if (!this.isVariantAvailable(variant)) {
        errors.push('Selected variant is currently out of stock');
      }
      return {
        isValid: errors.length === 0,
        errors: errors,
        variant: variant
      };
    }
  }]);
}();