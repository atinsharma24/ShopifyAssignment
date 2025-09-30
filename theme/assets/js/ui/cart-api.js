"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CartAPI = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var CartAPI = exports.CartAPI = /*#__PURE__*/function () {
  function CartAPI(fetchImpl) {
    _classCallCheck(this, CartAPI);
    this.fetch = fetchImpl || (typeof fetch === 'function' ? fetch : null);
    this.endpoints = {
      add: '/cart/add.js',
      cart: '/cart.js'
    };
  }
  return _createClass(CartAPI, [{
    key: "addToCart",
    value: function () {
      var _addToCart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(items) {
        var _this = this;
        var normalizedItems, validation, payload, response, errorData, message, cart, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              normalizedItems = Array.isArray(items) ? items : [items];
              validation = this.validateCartItems(normalizedItems);
              if (validation.isValid) {
                _context.n = 1;
                break;
              }
              return _context.a(2, {
                success: false,
                error: validation.errors.join(', '),
                cart: null
              });
            case 1:
              if (this.fetch) {
                _context.n = 2;
                break;
              }
              return _context.a(2, {
                success: false,
                error: 'Fetch API is not available',
                cart: null
              });
            case 2:
              payload = {
                items: normalizedItems.map(function (item) {
                  return {
                    id: Number(item.id),
                    quantity: _this.normalizeQuantity(item.quantity),
                    properties: item.properties || {}
                  };
                })
              };
              _context.p = 3;
              _context.n = 4;
              return this.fetch(this.endpoints.add, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json'
                },
                body: JSON.stringify(payload)
              });
            case 4:
              response = _context.v;
              if (response.ok) {
                _context.n = 6;
                break;
              }
              _context.n = 5;
              return response.json().catch(function () {
                return {};
              });
            case 5:
              errorData = _context.v;
              message = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || "HTTP ".concat(response.status);
              return _context.a(2, {
                success: false,
                error: message,
                cart: null
              });
            case 6:
              _context.n = 7;
              return response.json().catch(function () {
                return {};
              });
            case 7:
              _context.n = 8;
              return this.getCart();
            case 8:
              cart = _context.v;
              return _context.a(2, {
                success: true,
                cart: cart
              });
            case 9:
              _context.p = 9;
              _t = _context.v;
              return _context.a(2, {
                success: false,
                error: (_t === null || _t === void 0 ? void 0 : _t.message) || 'Unable to add to cart',
                cart: null
              });
          }
        }, _callee, this, [[3, 9]]);
      }));
      function addToCart(_x) {
        return _addToCart.apply(this, arguments);
      }
      return addToCart;
    }()
  }, {
    key: "getCart",
    value: function () {
      var _getCart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
        var response, _t2;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              if (this.fetch) {
                _context2.n = 1;
                break;
              }
              return _context2.a(2, null);
            case 1:
              _context2.p = 1;
              _context2.n = 2;
              return this.fetch(this.endpoints.cart, {
                method: 'GET',
                headers: {
                  Accept: 'application/json'
                }
              });
            case 2:
              response = _context2.v;
              if (response.ok) {
                _context2.n = 3;
                break;
              }
              return _context2.a(2, null);
            case 3:
              _context2.n = 4;
              return response.json();
            case 4:
              return _context2.a(2, _context2.v);
            case 5:
              _context2.p = 5;
              _t2 = _context2.v;
              return _context2.a(2, null);
          }
        }, _callee2, this, [[1, 5]]);
      }));
      function getCart() {
        return _getCart.apply(this, arguments);
      }
      return getCart;
    }()
  }, {
    key: "validateCartItems",
    value: function validateCartItems(items) {
      var _this2 = this;
      var errors = [];
      if (!Array.isArray(items) || items.length === 0) {
        errors.push('No items provided');
        return {
          isValid: false,
          errors: errors
        };
      }
      items.forEach(function (item, index) {
        if (!item || _typeof(item) !== 'object') {
          errors.push("Item ".concat(index + 1, ": Invalid item data"));
          return;
        }
        if (!_this2.isValidVariantId(item.id)) {
          errors.push("Item ".concat(index + 1, ": Variant ID is required"));
        }
        if (!_this2.isValidQuantity(item.quantity)) {
          errors.push("Item ".concat(index + 1, ": Quantity must be a positive integer"));
        }
      });
      return {
        isValid: errors.length === 0,
        errors: errors
      };
    }
  }, {
    key: "normalizeQuantity",
    value: function normalizeQuantity(quantity) {
      var value = Number.isInteger(quantity) ? quantity : 1;
      return value > 0 ? value : 1;
    }
  }, {
    key: "isValidQuantity",
    value: function isValidQuantity(quantity) {
      if (quantity === undefined) {
        return true;
      }
      return Number.isInteger(quantity) && quantity > 0;
    }
  }, {
    key: "isValidVariantId",
    value: function isValidVariantId(id) {
      var numericId = parseInt(id, 10);
      return !Number.isNaN(numericId) && numericId > 0;
    }
  }]);
}();