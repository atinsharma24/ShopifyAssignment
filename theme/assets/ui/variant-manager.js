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
var KNOWN_FLAVORS = ['chocolate', 'vanilla', 'orange'];
var VariantManager = exports.VariantManager = /*#__PURE__*/function () {
  function VariantManager(productData) {
    _classCallCheck(this, VariantManager);
    this.product = productData;
    this.variants = Array.isArray(productData.variants) ? _toConsumableArray(productData.variants) : [];
    console.log('VariantManager initialized with', this.variants.length, 'variants');
  }
  return _createClass(VariantManager, [{
    key: "findVariant",
    value: function findVariant(selections) {
      var _this = this;
      if (!selections) {
        return null;
      }
      var searchCriteria = this.createSearchCriteria(selections);
      var variant = this.variants.find(function (candidate) {
        return _this.matchesVariant(candidate, searchCriteria);
      });
      if (!variant) {
        console.warn('No variant found for selections:', selections);
        return null;
      }
      console.log('Found variant:', variant.id, 'for selections:', selections);
      return variant;
    }
  }, {
    key: "createSearchCriteria",
    value: function createSearchCriteria(selections) {
      var mode = typeof selections.mode === 'string' ? selections.mode.toLowerCase() : undefined;
      if (mode === 'single') {
        return {
          mode: 'Single',
          flavor: typeof selections.flavor === 'string' ? selections.flavor : undefined,
          type: 'subscription'
        };
      }
      if (mode === 'double') {
        return {
          mode: 'Double',
          flavor1: typeof selections.flavor1 === 'string' ? selections.flavor1 : undefined,
          flavor2: typeof selections.flavor2 === 'string' ? selections.flavor2 : undefined,
          type: 'subscription'
        };
      }
      return {};
    }
  }, {
    key: "matchesVariant",
    value: function matchesVariant(variant, criteria) {
      var _variant$title;
      if (!variant || !criteria) {
        return false;
      }
      var title = ((_variant$title = variant.title) !== null && _variant$title !== void 0 ? _variant$title : '').toString().toLowerCase();
      var options = Array.isArray(variant.options) ? variant.options.filter(function (opt) {
        return typeof opt === 'string';
      }).map(function (opt) {
        return opt.toLowerCase();
      }) : [];
      if (criteria.mode === 'Single') {
        if (!criteria.flavor) {
          return false;
        }
        var flavor = criteria.flavor.toLowerCase();
        var hasMode = title.includes('single') || options.some(function (opt) {
          return opt.includes('single');
        });
        var hasFlavor = title.includes(flavor) || options.some(function (opt) {
          return opt.includes(flavor);
        });
        return hasMode && hasFlavor;
      }
      if (criteria.mode === 'Double') {
        if (!criteria.flavor1 || !criteria.flavor2) {
          return false;
        }
        var flavor1 = criteria.flavor1.toLowerCase();
        var flavor2 = criteria.flavor2.toLowerCase();
        var _hasMode = title.includes('double') || options.some(function (opt) {
          return opt.includes('double');
        });
        var hasFlavor1 = title.includes(flavor1) || options.some(function (opt) {
          return opt.includes(flavor1);
        });
        var hasFlavor2 = title.includes(flavor2) || options.some(function (opt) {
          return opt.includes(flavor2);
        });
        return _hasMode && hasFlavor1 && hasFlavor2;
      }
      return false;
    }
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
  }, {
    key: "variantHasMode",
    value: function variantHasMode(variant, mode) {
      var _variant$title2;
      var title = ((_variant$title2 = variant.title) !== null && _variant$title2 !== void 0 ? _variant$title2 : '').toString().toLowerCase();
      var options = Array.isArray(variant.options) ? variant.options.filter(function (opt) {
        return typeof opt === 'string';
      }).map(function (opt) {
        return opt.toLowerCase();
      }) : [];
      var modeString = mode.toLowerCase();
      return title.includes(modeString) || options.some(function (opt) {
        return opt.includes(modeString);
      });
    }
  }, {
    key: "extractFlavorsFromVariant",
    value: function extractFlavorsFromVariant(variant) {
      var _variant$title3;
      var title = ((_variant$title3 = variant.title) !== null && _variant$title3 !== void 0 ? _variant$title3 : '').toString().toLowerCase();
      var options = Array.isArray(variant.options) ? variant.options.filter(function (opt) {
        return typeof opt === 'string';
      }).map(function (opt) {
        return opt.toLowerCase();
      }) : [];
      var searchText = [title].concat(_toConsumableArray(options)).join(' ');
      return KNOWN_FLAVORS.filter(function (flavor) {
        return searchText.includes(flavor);
      }).map(function (flavor) {
        return flavor.charAt(0).toUpperCase() + flavor.slice(1);
      });
    }
  }, {
    key: "isVariantAvailable",
    value: function isVariantAvailable(variant) {
      if (!variant) {
        return false;
      }
      var availableFlag = variant.available !== false;
      var inStock = variant.inventory_quantity !== 0;
      return availableFlag && inStock;
    }
  }, {
    key: "getVariantById",
    value: function getVariantById(variantId) {
      var _this$variants$find;
      return (_this$variants$find = this.variants.find(function (variant) {
        return String(variant.id) === String(variantId);
      })) !== null && _this$variants$find !== void 0 ? _this$variants$find : null;
    }
  }, {
    key: "getDefaultVariant",
    value: function getDefaultVariant() {
      var _this3 = this,
        _ref;
      var availableVariant = this.variants.find(function (variant) {
        return _this3.isVariantAvailable(variant);
      });
      return (_ref = availableVariant !== null && availableVariant !== void 0 ? availableVariant : this.variants[0]) !== null && _ref !== void 0 ? _ref : null;
    }
  }, {
    key: "generateAllCombinations",
    value: function generateAllCombinations() {
      var flavors = ['Chocolate', 'Vanilla', 'Orange'];
      var combinations = [];
      flavors.forEach(function (flavor) {
        combinations.push({
          mode: 'single',
          flavor: flavor
        });
      });
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
  }, {
    key: "validateSelections",
    value: function validateSelections(selections) {
      var errors = [];
      var mode = typeof selections.mode === 'string' ? selections.mode : '';
      if (!mode) {
        errors.push('Purchase mode is required');
      }
      if (mode === 'single') {
        var singleSelection = selections;
        if (typeof singleSelection.flavor !== 'string' || singleSelection.flavor.trim() === '') {
          errors.push('Flavor selection is required for single mode');
        }
      }
      if (mode === 'double') {
        var doubleSelection = selections;
        if (typeof doubleSelection.flavor1 !== 'string' || doubleSelection.flavor1.trim() === '') {
          errors.push('First flavor selection is required for double mode');
        }
        if (typeof doubleSelection.flavor2 !== 'string' || doubleSelection.flavor2.trim() === '') {
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
  }, {
    key: "selectVariantBySelections",
    value: function selectVariantBySelections(selections) {
      return this.findVariant(selections);
    }
  }, {
    key: "getSelectionForVariant",
    value: function getSelectionForVariant(variant) {
      var _variant$title4;
      var title = ((_variant$title4 = variant.title) !== null && _variant$title4 !== void 0 ? _variant$title4 : '').toString().toLowerCase();
      if (title.includes('single')) {
        var flavor = KNOWN_FLAVORS.find(function (flavorName) {
          return title.includes(flavorName);
        });
        if (flavor) {
          return {
            mode: 'single',
            flavor: flavor.charAt(0).toUpperCase() + flavor.slice(1)
          };
        }
      }
      if (title.includes('double')) {
        var flavors = KNOWN_FLAVORS.filter(function (flavorName) {
          return title.includes(flavorName);
        });
        if (flavors.length >= 2) {
          return {
            mode: 'double',
            flavor1: flavors[0].charAt(0).toUpperCase() + flavors[0].slice(1),
            flavor2: flavors[1].charAt(0).toUpperCase() + flavors[1].slice(1)
          };
        }
      }
      return null;
    }
  }]);
}();