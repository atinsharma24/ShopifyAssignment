/**
 * Main Product Page JavaScript
 * Handles variant selection, pricing calculations, and cart interactions
 */

// Main ProductPage module
window.ProductPage = (function() {
  'use strict';

  let productData = null;
  let variantManager = null;
  let pricing = null;
  let mediaGallery = null;
  let cartApi = null;

  /**
   * Initialize the product page functionality
   */
  function init() {
    productData = window.productData;
    if (!productData) {
      console.error('Product data not found');
      return;
    }

    // Initialize modules
    variantManager = new VariantManager(productData);
    pricing = new Pricing();
    mediaGallery = new MediaGallery();
    cartApi = new CartApi();

    // Set up event listeners
    setupEventListeners();

    // Initialize default state
    initializeDefaultState();

    console.log('ProductPage initialized successfully');
  }

  /**
   * Set up event listeners for user interactions
   */
  function setupEventListeners() {
    // Purchase mode radio buttons
    const modeRadios = document.querySelectorAll('input[name="purchase_mode"]');
    modeRadios.forEach(radio => {
      radio.addEventListener('change', handleModeChange);
    });

    // Flavor selection radio buttons
    const flavorRadios = document.querySelectorAll('input[name^="flavor_"]');
    flavorRadios.forEach(radio => {
      radio.addEventListener('change', handleFlavorChange);
    });

    // Add to cart form
    const addToCartForm = document.querySelector('form[data-type="add-to-cart-form"]');
    if (addToCartForm) {
      addToCartForm.addEventListener('submit', handleAddToCart);
    }

    // Media gallery thumbnails
    const thumbnails = document.querySelectorAll('.product__media-thumbnail');
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', handleThumbnailClick);
    });
  }

  /**
   * Initialize default state (Single + Chocolate)
   */
  function initializeDefaultState() {
    // Ensure single mode is selected
    const singleModeRadio = document.getElementById('mode-single');
    if (singleModeRadio) {
      singleModeRadio.checked = true;
    }

    // Ensure chocolate flavor is selected for first selector
    const chocolateFlavorRadio = document.getElementById('flavor-1-chocolate');
    if (chocolateFlavorRadio) {
      chocolateFlavorRadio.checked = true;
    }

    // Update UI based on default selections
    updateFlavorSelectors();
    updateVariantAndPricing();
    updateWhatsIncluded();
  }

  /**
   * Handle purchase mode change (single/double)
   */
  function handleModeChange(event) {
    updateFlavorSelectors();
    updateVariantAndPricing();
    updateWhatsIncluded();
  }

  /**
   * Handle flavor selection change
   */
  function handleFlavorChange(event) {
    updateVariantAndPricing();
  }

  /**
   * Update flavor selector visibility based on mode
   */
  function updateFlavorSelectors() {
    const selectedMode = document.querySelector('input[name="purchase_mode"]:checked')?.value;
    const flavorSelector2 = document.getElementById('flavor-selector-2');

    if (selectedMode === 'double') {
      flavorSelector2?.classList.remove('flavor-selector--hidden');
      // Ensure second flavor selector has a selection
      const secondFlavorRadios = document.querySelectorAll('input[name="flavor_2"]');
      const hasSelection = Array.from(secondFlavorRadios).some(radio => radio.checked);
      if (!hasSelection && secondFlavorRadios.length > 0) {
        secondFlavorRadios[0].checked = true; // Default to first option
      }
    } else {
      flavorSelector2?.classList.add('flavor-selector--hidden');
      // Clear second flavor selection
      const secondFlavorRadios = document.querySelectorAll('input[name="flavor_2"]');
      secondFlavorRadios.forEach(radio => radio.checked = false);
    }
  }

  /**
   * Update variant selection and pricing display
   */
  function updateVariantAndPricing() {
    const selections = getCurrentSelections();
    const variant = variantManager.findMatchingVariant(selections);
    
    if (variant) {
      // Update hidden variant selector
      const variantSelect = document.querySelector('select[name="id"]');
      if (variantSelect) {
        variantSelect.value = variant.id;
      }

      // Update pricing display
      pricing.updatePriceDisplay(variant.price);

      // Update add to cart button
      updateAddToCartButton(variant);

      // Update media gallery if variant has specific media
      if (variant.featured_image) {
        mediaGallery.updateActiveMedia(variant.featured_image.id);
      }
    } else {
      // No matching variant found
      console.warn('No matching variant found for selections:', selections);
      updateAddToCartButton(null);
    }
  }

  /**
   * Update "What's Included" content based on mode
   */
  function updateWhatsIncluded() {
    const selectedMode = document.querySelector('input[name="purchase_mode"]:checked')?.value;
    const contents = document.querySelectorAll('.whats-included-content');
    
    contents.forEach(content => {
      const contentMode = content.getAttribute('data-mode');
      if (contentMode === selectedMode) {
        content.classList.remove('whats-included-content--hidden');
      } else {
        content.classList.add('whats-included-content--hidden');
      }
    });
  }

  /**
   * Get current user selections
   */
  function getCurrentSelections() {
    const mode = document.querySelector('input[name="purchase_mode"]:checked')?.value;
    const flavor1 = document.querySelector('input[name="flavor_1"]:checked')?.value;
    const flavor2 = document.querySelector('input[name="flavor_2"]:checked')?.value;

    return {
      mode: mode,
      flavors: mode === 'double' ? [flavor1, flavor2].filter(Boolean) : [flavor1].filter(Boolean)
    };
  }

  /**
   * Update add to cart button state
   */
  function updateAddToCartButton(variant) {
    const button = document.querySelector('.product-form__cart-submit');
    const buttonText = button?.querySelector('span');
    
    if (!button) return;

    if (variant && variant.available) {
      button.disabled = false;
      button.classList.remove('disabled');
      if (buttonText) buttonText.textContent = 'Add to cart';
    } else {
      button.disabled = true;
      button.classList.add('disabled');
      if (buttonText) buttonText.textContent = variant ? 'Sold out' : 'Unavailable';
    }
  }

  /**
   * Handle thumbnail clicks for media gallery
   */
  function handleThumbnailClick(event) {
    const mediaId = event.currentTarget.getAttribute('data-media-id');
    if (mediaId) {
      mediaGallery.updateActiveMedia(mediaId);
    }
  }

  /**
   * Handle add to cart form submission
   */
  function handleAddToCart(event) {
    event.preventDefault();
    
    const selections = getCurrentSelections();
    const variant = variantManager.findMatchingVariant(selections);
    
    if (!variant || !variant.available) {
      showError('Please select an available variant');
      return;
    }

    // Show loading state
    const button = event.target.querySelector('.product-form__cart-submit');
    const loadingOverlay = button?.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }

    // For double mode, we might need to add multiple items
    const itemsToAdd = variantManager.getCartItems(selections);
    
    cartApi.addToCart(itemsToAdd)
      .then(response => {
        console.log('Successfully added to cart:', response);
        showSuccess('Added to cart successfully!');
      })
      .catch(error => {
        console.error('Failed to add to cart:', error);
        showError('Failed to add to cart. Please try again.');
      })
      .finally(() => {
        // Hide loading state
        if (loadingOverlay) {
          loadingOverlay.classList.add('hidden');
        }
      });
  }

  /**
   * Show error message
   */
  function showError(message) {
    const errorContainer = document.querySelector('[id^="cart-errors-"]');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.hidden = false;
      setTimeout(() => {
        errorContainer.hidden = true;
      }, 5000);
    }
  }

  /**
   * Show success message
   */
  function showSuccess(message) {
    // Create or update success message
    let successContainer = document.querySelector('.cart-success-message');
    if (!successContainer) {
      successContainer = document.createElement('div');
      successContainer.className = 'cart-success-message form__message form__message--success';
      const errorContainer = document.querySelector('[id^="cart-errors-"]');
      if (errorContainer && errorContainer.parentNode) {
        errorContainer.parentNode.insertBefore(successContainer, errorContainer.nextSibling);
      }
    }
    
    successContainer.textContent = message;
    successContainer.hidden = false;
    setTimeout(() => {
      successContainer.hidden = true;
    }, 3000);
  }

  // Public API
  return {
    init: init,
    updateVariantAndPricing: updateVariantAndPricing,
    getCurrentSelections: getCurrentSelections
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.productData) {
      window.ProductPage.init();
    }
  });
} else if (window.productData) {
  window.ProductPage.init();
}