"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MediaGallery = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var MediaGallery = exports.MediaGallery = /*#__PURE__*/function () {
  function MediaGallery() {
    _classCallCheck(this, MediaGallery);
    _defineProperty(this, "mediaItems", []);
    _defineProperty(this, "currentIndex", 0);
    _defineProperty(this, "elements", {
      gallery: null,
      mainMediaContainer: null,
      mainMedia: null,
      thumbnails: [],
      navButtons: []
    });
  }
  return _createClass(MediaGallery, [{
    key: "init",
    value: function init() {
      var rootElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.cacheElements(rootElement);
      if (!this.elements.gallery) {
        return;
      }
      this.collectMediaItems();
      this.bindEvents();
      if (this.mediaItems.length) {
        this.selectMedia(this.resolveInitialIndex());
      }
    }
  }, {
    key: "cacheElements",
    value: function cacheElements(rootElement) {
      var _mainMediaContainer$q;
      var gallery = rootElement instanceof HTMLElement ? rootElement : document.querySelector('[data-media-gallery]');
      this.elements.gallery = gallery !== null && gallery !== void 0 ? gallery : null;
      if (!gallery) {
        this.elements.mainMediaContainer = null;
        this.elements.mainMedia = null;
        this.elements.thumbnails = [];
        this.elements.navButtons = [];
        return;
      }
      var mainMediaContainer = gallery.querySelector('[data-main-media]') || gallery.querySelector('.media-container') || gallery;
      this.elements.mainMediaContainer = mainMediaContainer !== null && mainMediaContainer !== void 0 ? mainMediaContainer : null;
      var mainMedia = (_mainMediaContainer$q = mainMediaContainer === null || mainMediaContainer === void 0 ? void 0 : mainMediaContainer.querySelector('[data-main-image], .main-image, .main-video')) !== null && _mainMediaContainer$q !== void 0 ? _mainMediaContainer$q : null;
      this.elements.mainMedia = mainMedia;
      var thumbnailSelector = '[data-media-thumbnails] button, .media-thumbnails button, .media-thumbnail, .thumbnail';
      this.elements.thumbnails = Array.from(gallery.querySelectorAll(thumbnailSelector));
      this.elements.navButtons = Array.from(gallery.querySelectorAll('[data-media-nav]'));
    }
  }, {
    key: "collectMediaItems",
    value: function collectMediaItems() {
      var _this = this;
      var _this$elements = this.elements,
        thumbnails = _this$elements.thumbnails,
        mainMedia = _this$elements.mainMedia;
      if (!thumbnails.length && mainMedia) {
        var mediaId = (mainMedia.dataset.mediaId || 'main').toString();
        var isVideo = mainMedia instanceof HTMLVideoElement;
        this.mediaItems = [{
          id: mediaId,
          index: 0,
          type: isVideo ? 'video' : 'image',
          thumbnailSrc: this.getMediaSource(mainMedia),
          fullSrc: this.getMediaSource(mainMedia),
          alt: mainMedia instanceof HTMLImageElement ? mainMedia.alt : '',
          element: null
        }];
        return;
      }
      this.mediaItems = thumbnails.map(function (thumbnail, index) {
        if (thumbnail.tagName === 'BUTTON' && !thumbnail.hasAttribute('type')) {
          thumbnail.setAttribute('type', 'button');
        }
        var image = thumbnail.querySelector('img');
        var thumbSrc = (image === null || image === void 0 ? void 0 : image.dataset.src) || (image === null || image === void 0 ? void 0 : image.getAttribute('data-src')) || (image === null || image === void 0 ? void 0 : image.src) || '';
        var mediaId = (thumbnail.dataset.mediaId || "media-".concat(index)).toString();
        var mediaType = (thumbnail.dataset.mediaType || '').toLowerCase();
        var isVideo = mediaType === 'video' || thumbnail.dataset.mediaVideo === 'true';
        thumbnail.dataset.mediaIndex = index.toString();
        return {
          id: mediaId,
          index: index,
          type: isVideo ? 'video' : 'image',
          thumbnailSrc: thumbSrc || '',
          fullSrc: (image === null || image === void 0 ? void 0 : image.dataset.fullSrc) || _this.getHighResImageUrl(thumbSrc || ''),
          alt: (image === null || image === void 0 ? void 0 : image.alt) || thumbnail.getAttribute('aria-label') || '',
          element: thumbnail,
          videoSrc: thumbnail.dataset.mediaVideoSrc || ''
        };
      });
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this2 = this;
      this.elements.thumbnails.forEach(function (thumbnail, index) {
        thumbnail.addEventListener('click', function () {
          return _this2.selectMedia(index);
        });
        thumbnail.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            _this2.selectMedia(index);
          }
        });
      });
      this.elements.navButtons.forEach(function (button) {
        var direction = (button.dataset.mediaNav || '').toLowerCase();
        button.addEventListener('click', function () {
          if (direction === 'prev') {
            _this2.selectMedia(_this2.currentIndex - 1);
          } else if (direction === 'next') {
            _this2.selectMedia(_this2.currentIndex + 1);
          }
        });
      });
    }
  }, {
    key: "resolveInitialIndex",
    value: function resolveInitialIndex() {
      var _this$elements$mainMe;
      var activeIndex = this.mediaItems.findIndex(function (item) {
        var _item$element;
        return (_item$element = item.element) === null || _item$element === void 0 ? void 0 : _item$element.classList.contains('active');
      });
      if (activeIndex >= 0) {
        return activeIndex;
      }
      var activeId = (_this$elements$mainMe = this.elements.mainMedia) === null || _this$elements$mainMe === void 0 ? void 0 : _this$elements$mainMe.dataset.mediaId;
      if (activeId) {
        var matchIndex = this.mediaItems.findIndex(function (item) {
          return item.id === activeId.toString();
        });
        if (matchIndex >= 0) {
          return matchIndex;
        }
      }
      return 0;
    }
  }, {
    key: "selectMedia",
    value: function selectMedia(index) {
      if (!this.mediaItems.length) {
        return;
      }
      var boundedIndex = (index % this.mediaItems.length + this.mediaItems.length) % this.mediaItems.length;
      var mediaItem = this.mediaItems[boundedIndex];
      this.currentIndex = boundedIndex;
      this.renderMainMedia(mediaItem);
      this.updateThumbnailState(boundedIndex);
      this.announceChange(mediaItem);
    }
  }, {
    key: "renderMainMedia",
    value: function renderMainMedia(mediaItem) {
      var container = this.elements.mainMediaContainer;
      if (!container) {
        return;
      }
      container.innerHTML = '';
      if (mediaItem.type === 'video' && mediaItem.videoSrc) {
        var video = document.createElement('video');
        video.controls = true;
        video.className = 'media-video main-video';
        video.dataset.mediaId = mediaItem.id;
        var source = document.createElement('source');
        source.src = mediaItem.videoSrc;
        source.type = 'video/mp4';
        video.appendChild(source);
        container.appendChild(video);
        this.elements.mainMedia = video;
        return;
      }
      var img = document.createElement('img');
      img.src = this.getHighResImageUrl(mediaItem.fullSrc || mediaItem.thumbnailSrc);
      img.alt = mediaItem.alt || '';
      img.className = 'media-image main-image';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.dataset.mediaId = mediaItem.id;
      container.appendChild(img);
      this.elements.mainMedia = img;
    }
  }, {
    key: "updateThumbnailState",
    value: function updateThumbnailState(activeIndex) {
      this.elements.thumbnails.forEach(function (thumbnail, index) {
        var isActive = index === activeIndex;
        thumbnail.classList.toggle('active', isActive);
        thumbnail.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
  }, {
    key: "selectMediaByVariant",
    value: function selectMediaByVariant(variant) {
      var _variant$featured_med, _variant$featured_ima, _variant$featured_ima2;
      if (!variant) {
        return;
      }
      var mediaId = ((_variant$featured_med = variant.featured_media) === null || _variant$featured_med === void 0 ? void 0 : _variant$featured_med.id) || variant.featured_media_id || variant.image_id || ((_variant$featured_ima = variant.featured_image) === null || _variant$featured_ima === void 0 ? void 0 : _variant$featured_ima.id);
      if (mediaId !== undefined && mediaId !== null) {
        this.selectMediaById(mediaId);
        return;
      }
      var imageSrc = typeof ((_variant$featured_ima2 = variant.featured_image) === null || _variant$featured_ima2 === void 0 ? void 0 : _variant$featured_ima2.src) === 'string' ? variant.featured_image.src : null;
      if (!imageSrc) {
        return;
      }
      var matchIndex = this.mediaItems.findIndex(function (item) {
        return item.thumbnailSrc && item.thumbnailSrc.includes(imageSrc) || item.fullSrc && item.fullSrc.includes(imageSrc);
      });
      if (matchIndex >= 0) {
        this.selectMedia(matchIndex);
      }
    }
  }, {
    key: "selectMediaById",
    value: function selectMediaById(mediaId) {
      if (mediaId === undefined || mediaId === null) {
        return;
      }
      var id = mediaId.toString();
      var index = this.mediaItems.findIndex(function (item) {
        return item.id === id;
      });
      if (index >= 0) {
        this.selectMedia(index);
      }
    }
  }, {
    key: "getHighResImageUrl",
    value: function getHighResImageUrl(thumbnailUrl) {
      if (!thumbnailUrl) {
        return thumbnailUrl;
      }
      if (thumbnailUrl.includes('_100x100')) {
        return thumbnailUrl.replace('_100x100', '_800x800');
      }
      if (thumbnailUrl.includes('_100x')) {
        return thumbnailUrl.replace('_100x', '_800x');
      }
      if (thumbnailUrl.includes('width=100')) {
        return thumbnailUrl.replace('width=100', 'width=800');
      }
      return thumbnailUrl;
    }
  }, {
    key: "announceChange",
    value: function announceChange(mediaItem) {
      var announcement = "".concat(mediaItem.type, " ").concat(this.currentIndex + 1, " of ").concat(this.mediaItems.length, ": ").concat(mediaItem.alt || '');
      var liveRegion = document.getElementById('media-announcer');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'media-announcer';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
      }
      liveRegion.textContent = announcement;
    }
  }, {
    key: "getMediaSource",
    value: function getMediaSource(media) {
      if (media instanceof HTMLVideoElement) {
        return media.currentSrc || media.src || '';
      }
      return media.currentSrc || media.src || '';
    }
  }]);
}();