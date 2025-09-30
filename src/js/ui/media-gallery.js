export class MediaGallery {
  constructor() {
    this.mediaItems = [];
    this.currentIndex = 0;
    this.elements = {
      gallery: null,
      mainMediaContainer: null,
      mainMedia: null,
      thumbnails: [],
      navButtons: []
    };
  }

  init(rootElement = null) {
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

  cacheElements(rootElement) {
    const gallery = rootElement || document.querySelector('[data-media-gallery]');
    this.elements.gallery = gallery;

    if (!gallery) {
      this.elements.mainMediaContainer = null;
      this.elements.mainMedia = null;
      this.elements.thumbnails = [];
      this.elements.navButtons = [];
      return;
    }

    const mainMediaContainer =
      gallery.querySelector('[data-main-media]') ||
      gallery.querySelector('.media-container') ||
      gallery;

    this.elements.mainMediaContainer = mainMediaContainer;
    this.elements.mainMedia =
      mainMediaContainer?.querySelector('[data-main-image], .main-image, .main-video') ||
      null;

    const thumbnailSelector =
      '[data-media-thumbnails] button, .media-thumbnails button, .media-thumbnail, .thumbnail';
    this.elements.thumbnails = Array.from(gallery.querySelectorAll(thumbnailSelector));
    this.elements.navButtons = Array.from(gallery.querySelectorAll('[data-media-nav]'));
  }

  collectMediaItems() {
    if (!this.elements.thumbnails.length && this.elements.mainMedia) {
      const mediaId = (this.elements.mainMedia.dataset.mediaId || 'main').toString();
      this.mediaItems = [
        {
          id: mediaId,
          index: 0,
          type: this.elements.mainMedia.tagName === 'VIDEO' ? 'video' : 'image',
          thumbnailSrc: this.elements.mainMedia.currentSrc || this.elements.mainMedia.src || '',
          fullSrc: this.elements.mainMedia.currentSrc || this.elements.mainMedia.src || '',
          alt: this.elements.mainMedia.alt || '',
          element: null
        }
      ];
      return;
    }

    this.mediaItems = this.elements.thumbnails.map((thumbnail, index) => {
      if (thumbnail.tagName === 'BUTTON' && !thumbnail.hasAttribute('type')) {
        thumbnail.setAttribute('type', 'button');
      }

      const image = thumbnail.querySelector('img');
      const thumbSrc = image?.getAttribute('data-src') || image?.src || '';

      const mediaId = (thumbnail.dataset.mediaId || `media-${index}`).toString();
      const mediaType = (thumbnail.dataset.mediaType || '').toLowerCase();
      const isVideo = mediaType === 'video' || thumbnail.dataset.mediaVideo === 'true';

      thumbnail.dataset.mediaIndex = index.toString();

      return {
        id: mediaId,
        index,
        type: isVideo ? 'video' : 'image',
        thumbnailSrc: thumbSrc,
        fullSrc: image?.dataset.fullSrc || this.getHighResImageUrl(thumbSrc),
        alt: image?.alt || thumbnail.getAttribute('aria-label') || '',
        element: thumbnail,
        videoSrc: thumbnail.dataset.mediaVideoSrc || ''
      };
    });
  }

  bindEvents() {
    this.elements.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => this.selectMedia(index));
      thumbnail.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.selectMedia(index);
        }
      });
    });

    this.elements.navButtons.forEach((button) => {
      const direction = (button.dataset.mediaNav || '').toLowerCase();

      button.addEventListener('click', () => {
        if (direction === 'prev') {
          this.selectMedia(this.currentIndex - 1);
        } else if (direction === 'next') {
          this.selectMedia(this.currentIndex + 1);
        }
      });
    });
  }

  resolveInitialIndex() {
    const activeIndex = this.mediaItems.findIndex((item) => item.element?.classList.contains('active'));
    if (activeIndex >= 0) {
      return activeIndex;
    }

    const activeId = this.elements.mainMedia?.dataset.mediaId;
    if (activeId) {
      const matchIndex = this.mediaItems.findIndex((item) => item.id === activeId.toString());
      if (matchIndex >= 0) {
        return matchIndex;
      }
    }

    return 0;
  }

  selectMedia(index) {
    if (!this.mediaItems.length) {
      return;
    }

    const boundedIndex = ((index % this.mediaItems.length) + this.mediaItems.length) % this.mediaItems.length;
    const mediaItem = this.mediaItems[boundedIndex];
    this.currentIndex = boundedIndex;

    this.renderMainMedia(mediaItem);
    this.updateThumbnailState(boundedIndex);
    this.announceChange(mediaItem);
  }

  renderMainMedia(mediaItem) {
    const container = this.elements.mainMediaContainer;
    if (!container) {
      return;
    }

    container.innerHTML = '';

    if (mediaItem.type === 'video' && mediaItem.videoSrc) {
      const video = document.createElement('video');
      video.controls = true;
      video.className = 'media-video main-video';
      video.dataset.mediaId = mediaItem.id;

      const source = document.createElement('source');
      source.src = mediaItem.videoSrc;
      source.type = 'video/mp4';
      video.appendChild(source);

      container.appendChild(video);
      this.elements.mainMedia = video;
      return;
    }

    const img = document.createElement('img');
    img.src = this.getHighResImageUrl(mediaItem.fullSrc || mediaItem.thumbnailSrc);
    img.alt = mediaItem.alt || '';
    img.className = 'media-image main-image';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.dataset.mediaId = mediaItem.id;

    container.appendChild(img);
    this.elements.mainMedia = img;
  }

  updateThumbnailState(activeIndex) {
    this.elements.thumbnails.forEach((thumbnail, index) => {
      const isActive = index === activeIndex;
      thumbnail.classList.toggle('active', isActive);
      thumbnail.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  selectMediaByVariant(variant) {
    if (!variant) {
      return;
    }

    const mediaId =
      variant.featured_media?.id ||
      variant.featured_media_id ||
      variant.image_id ||
      variant.featured_image?.id;

    if (mediaId) {
      this.selectMediaById(mediaId);
      return;
    }

    const imageSrc = variant.featured_image?.src;
    if (!imageSrc) {
      return;
    }

    const matchIndex = this.mediaItems.findIndex((item) =>
      item.thumbnailSrc?.includes(imageSrc) || item.fullSrc?.includes(imageSrc)
    );

    if (matchIndex >= 0) {
      this.selectMedia(matchIndex);
    }
  }

  selectMediaById(mediaId) {
    const id = mediaId?.toString();
    if (!id) {
      return;
    }

    const index = this.mediaItems.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.selectMedia(index);
    }
  }

  getHighResImageUrl(thumbnailUrl) {
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

  announceChange(mediaItem) {
    if (!mediaItem) {
      return;
    }

    const announcement = `${mediaItem.type} ${this.currentIndex + 1} of ${this.mediaItems.length}: ${mediaItem.alt || ''}`;
    let liveRegion = document.getElementById('media-announcer');

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
}