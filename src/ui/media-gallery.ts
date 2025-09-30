import type { ShopifyProductVariant } from '../types/shopify';

type MediaType = 'image' | 'video';

type MediaItem = {
  id: string;
  index: number;
  type: MediaType;
  thumbnailSrc: string;
  fullSrc: string;
  alt: string;
  element: HTMLElement | null;
  videoSrc?: string;
};

type MediaGalleryElements = {
  gallery: HTMLElement | null;
  mainMediaContainer: HTMLElement | null;
  mainMedia: HTMLImageElement | HTMLVideoElement | null;
  thumbnails: HTMLElement[];
  navButtons: HTMLElement[];
};

export class MediaGallery {
  private mediaItems: MediaItem[] = [];
  private currentIndex = 0;
  private elements: MediaGalleryElements = {
    gallery: null,
    mainMediaContainer: null,
    mainMedia: null,
    thumbnails: [],
    navButtons: []
  };

  init(rootElement: HTMLElement | Document | null = null): void {
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

  private cacheElements(rootElement: HTMLElement | Document | null): void {
    const gallery =
      rootElement instanceof HTMLElement
        ? rootElement
        : document.querySelector<HTMLElement>('[data-media-gallery]');

    this.elements.gallery = gallery ?? null;

    if (!gallery) {
      this.elements.mainMediaContainer = null;
      this.elements.mainMedia = null;
      this.elements.thumbnails = [];
      this.elements.navButtons = [];
      return;
    }

    const mainMediaContainer =
      gallery.querySelector<HTMLElement>('[data-main-media]') ||
      gallery.querySelector<HTMLElement>('.media-container') ||
      gallery;

    this.elements.mainMediaContainer = mainMediaContainer ?? null;

    const mainMedia = mainMediaContainer?.querySelector<HTMLImageElement | HTMLVideoElement>(
      '[data-main-image], .main-image, .main-video'
    ) ?? null;
    this.elements.mainMedia = mainMedia;

    const thumbnailSelector =
      '[data-media-thumbnails] button, .media-thumbnails button, .media-thumbnail, .thumbnail';
    this.elements.thumbnails = Array.from(
      gallery.querySelectorAll<HTMLElement>(thumbnailSelector)
    );
    this.elements.navButtons = Array.from(
      gallery.querySelectorAll<HTMLElement>('[data-media-nav]')
    );
  }

  private collectMediaItems(): void {
    const { thumbnails, mainMedia } = this.elements;

    if (!thumbnails.length && mainMedia) {
      const mediaId = (mainMedia.dataset.mediaId || 'main').toString();
      const isVideo = mainMedia instanceof HTMLVideoElement;

      this.mediaItems = [
        {
          id: mediaId,
          index: 0,
          type: isVideo ? 'video' : 'image',
          thumbnailSrc: this.getMediaSource(mainMedia),
          fullSrc: this.getMediaSource(mainMedia),
          alt: mainMedia instanceof HTMLImageElement ? mainMedia.alt : '',
          element: null
        }
      ];
      return;
    }

    this.mediaItems = thumbnails.map((thumbnail, index) => {
      if (thumbnail.tagName === 'BUTTON' && !thumbnail.hasAttribute('type')) {
        thumbnail.setAttribute('type', 'button');
      }

      const image = thumbnail.querySelector<HTMLImageElement>('img');
      const thumbSrc = image?.dataset.src || image?.getAttribute('data-src') || image?.src || '';

      const mediaId = (thumbnail.dataset.mediaId || `media-${index}`).toString();
      const mediaType = (thumbnail.dataset.mediaType || '').toLowerCase();
      const isVideo = mediaType === 'video' || thumbnail.dataset.mediaVideo === 'true';

      thumbnail.dataset.mediaIndex = index.toString();

      return {
        id: mediaId,
        index,
        type: isVideo ? 'video' : 'image',
        thumbnailSrc: thumbSrc || '',
        fullSrc: image?.dataset.fullSrc || this.getHighResImageUrl(thumbSrc || ''),
        alt: image?.alt || thumbnail.getAttribute('aria-label') || '',
        element: thumbnail,
        videoSrc: thumbnail.dataset.mediaVideoSrc || ''
      } satisfies MediaItem;
    });
  }

  private bindEvents(): void {
    this.elements.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => this.selectMedia(index));
      thumbnail.addEventListener('keydown', (event: KeyboardEvent) => {
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

  private resolveInitialIndex(): number {
    const activeIndex = this.mediaItems.findIndex((item) =>
      item.element?.classList.contains('active')
    );
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

  selectMedia(index: number): void {
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

  private renderMainMedia(mediaItem: MediaItem): void {
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

  private updateThumbnailState(activeIndex: number): void {
    this.elements.thumbnails.forEach((thumbnail, index) => {
      const isActive = index === activeIndex;
      thumbnail.classList.toggle('active', isActive);
      thumbnail.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  selectMediaByVariant(variant: ShopifyProductVariant | null | undefined): void {
    if (!variant) {
      return;
    }

    const mediaId =
      variant.featured_media?.id ||
      variant.featured_media_id ||
      variant.image_id ||
      variant.featured_image?.id;

    if (mediaId !== undefined && mediaId !== null) {
      this.selectMediaById(mediaId);
      return;
    }

    const imageSrc = typeof variant.featured_image?.src === 'string' ? variant.featured_image.src : null;
    if (!imageSrc) {
      return;
    }

    const matchIndex = this.mediaItems.findIndex((item) =>
      (item.thumbnailSrc && item.thumbnailSrc.includes(imageSrc)) ||
      (item.fullSrc && item.fullSrc.includes(imageSrc))
    );

    if (matchIndex >= 0) {
      this.selectMedia(matchIndex);
    }
  }

  selectMediaById(mediaId: number | string | null | undefined): void {
    if (mediaId === undefined || mediaId === null) {
      return;
    }

    const id = mediaId.toString();
    const index = this.mediaItems.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.selectMedia(index);
    }
  }

  private getHighResImageUrl(thumbnailUrl: string): string {
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

  private announceChange(mediaItem: MediaItem): void {
    const announcement = `${mediaItem.type} ${this.currentIndex + 1} of ${this.mediaItems.length}: ${
      mediaItem.alt || ''
    }`;
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

  private getMediaSource(media: HTMLImageElement | HTMLVideoElement): string {
    if (media instanceof HTMLVideoElement) {
      return media.currentSrc || media.src || '';
    }

    return media.currentSrc || media.src || '';
  }
}
