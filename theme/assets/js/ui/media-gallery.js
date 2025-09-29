/**
 * MediaGallery - Handles product image gallery interactions
 */
class MediaGallery {
  constructor() {
    this.currentMediaId = null;
    this.mediaItems = [];
    this.thumbnails = [];
    this.init();
  }

  /**
   * Initialize media gallery functionality
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.setInitialActiveMedia();
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.gallery = document.querySelector('.product__media-gallery');
    this.mediaItems = Array.from(document.querySelectorAll('.product__media-item'));
    this.thumbnails = Array.from(document.querySelectorAll('.product__media-thumbnail'));
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Thumbnail click events
    this.thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', event => {
        event.preventDefault();
        const mediaId = thumbnail.getAttribute('data-media-id');
        if (mediaId) {
          this.updateActiveMedia(mediaId);
        }
      });

      // Keyboard support for thumbnails
      thumbnail.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          thumbnail.click();
        }
      });
    });

    // Keyboard navigation for gallery
    if (this.gallery) {
      this.gallery.addEventListener('keydown', event => {
        this.handleKeyboardNavigation(event);
      });
    }

    // Listen for variant changes to update media
    document.addEventListener('variantChanged', event => {
      const variant = event.detail.variant;
      if (variant && variant.featured_image && variant.featured_image.id) {
        this.updateActiveMedia(variant.featured_image.id);
      }
    });
  }

  /**
   * Set initial active media (first media item or variant-specific)
   */
  setInitialActiveMedia() {
    const activeItem = document.querySelector('.product__media-item--active');
    if (activeItem) {
      this.currentMediaId = activeItem.getAttribute('data-media-id');
    } else if (this.mediaItems.length > 0) {
      const firstMediaId = this.mediaItems[0].getAttribute('data-media-id');
      this.updateActiveMedia(firstMediaId);
    }
  }

  /**
   * Update active media item and thumbnail
   * @param {string} mediaId - Media ID to activate
   */
  updateActiveMedia(mediaId) {
    if (!mediaId || mediaId === this.currentMediaId) {
      return;
    }

    // Update media items
    this.mediaItems.forEach(item => {
      const itemMediaId = item.getAttribute('data-media-id');
      if (itemMediaId === mediaId) {
        item.classList.add('product__media-item--active');
        this.announceToScreenReader(`Viewing image ${this.getMediaIndex(mediaId) + 1}`);
      } else {
        item.classList.remove('product__media-item--active');
      }
    });

    // Update thumbnails
    this.thumbnails.forEach(thumbnail => {
      const thumbnailMediaId = thumbnail.getAttribute('data-media-id');
      if (thumbnailMediaId === mediaId) {
        thumbnail.classList.add('product__media-thumbnail--active');
        thumbnail.setAttribute('aria-pressed', 'true');
      } else {
        thumbnail.classList.remove('product__media-thumbnail--active');
        thumbnail.setAttribute('aria-pressed', 'false');
      }
    });
    this.currentMediaId = mediaId;

    // Trigger custom event for other modules
    const mediaChangeEvent = new CustomEvent('mediaChanged', {
      detail: {
        mediaId: mediaId,
        mediaIndex: this.getMediaIndex(mediaId)
      }
    });
    document.dispatchEvent(mediaChangeEvent);
  }

  /**
   * Handle keyboard navigation for gallery
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboardNavigation(event) {
    if (!this.currentMediaId) return;
    const currentIndex = this.getMediaIndex(this.currentMediaId);
    let newIndex = currentIndex;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : this.mediaItems.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < this.mediaItems.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = this.mediaItems.length - 1;
        break;
      default:
        return;
      // Don't handle other keys
    }
    if (newIndex !== currentIndex && this.mediaItems[newIndex]) {
      const newMediaId = this.mediaItems[newIndex].getAttribute('data-media-id');
      this.updateActiveMedia(newMediaId);
    }
  }

  /**
   * Get index of media item by media ID
   * @param {string} mediaId - Media ID
   * @returns {number} - Index of media item
   */
  getMediaIndex(mediaId) {
    return this.mediaItems.findIndex(item => item.getAttribute('data-media-id') === mediaId);
  }

  /**
   * Get media item by media ID
   * @param {string} mediaId - Media ID
   * @returns {Element|null} - Media item element
   */
  getMediaItem(mediaId) {
    return this.mediaItems.find(item => item.getAttribute('data-media-id') === mediaId) || null;
  }

  /**
   * Announce changes to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    // Create or update live region for screen reader announcements
    let liveRegion = document.getElementById('media-gallery-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'media-gallery-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'visually-hidden';
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
  }

  /**
   * Preload images for better performance
   */
  preloadImages() {
    this.mediaItems.forEach(item => {
      const img = item.querySelector('img');
      if (img && img.dataset.src) {
        const preloadImg = new Image();
        preloadImg.src = img.dataset.src;
      }
    });
  }

  /**
   * Enable zoom functionality for media items
   * @param {boolean} enable - Whether to enable zoom
   */
  enableZoom(enable = true) {
    this.mediaItems.forEach(item => {
      const img = item.querySelector('img');
      if (img) {
        if (enable) {
          img.addEventListener('click', this.handleImageZoom.bind(this));
          img.style.cursor = 'zoom-in';
          img.setAttribute('title', 'Click to zoom');
        } else {
          img.removeEventListener('click', this.handleImageZoom.bind(this));
          img.style.cursor = 'default';
          img.removeAttribute('title');
        }
      }
    });
  }

  /**
   * Handle image zoom functionality
   * @param {Event} event - Click event
   */
  handleImageZoom(event) {
    const img = event.target;
    const modal = this.createZoomModal(img);
    document.body.appendChild(modal);

    // Focus the modal for accessibility
    modal.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Create zoom modal for image
   * @param {Element} img - Image element to zoom
   * @returns {Element} - Modal element
   */
  createZoomModal(img) {
    const modal = document.createElement('div');
    modal.className = 'media-zoom-modal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Zoomed product image');
    modal.innerHTML = `
      <div class="media-zoom-overlay">
        <button class="media-zoom-close" aria-label="Close zoom">×</button>
        <img src="${img.src}" alt="${img.alt}" class="media-zoom-image">
      </div>
    `;

    // Close modal handlers
    const closeBtn = modal.querySelector('.media-zoom-close');
    const overlay = modal.querySelector('.media-zoom-overlay');
    const closeModal = () => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    };
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
    return modal;
  }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaGallery;
} else {
  // Make available globally in browser
  window.MediaGallery = MediaGallery;
}