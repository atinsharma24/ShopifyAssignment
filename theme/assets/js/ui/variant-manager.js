/**
 * VariantManager - Handles mapping user selections to Shopify variants
 */
class VariantManager {
  constructor(productData) {
    this.product = productData || {};
    this.variants = productData && productData.variants || [];
  }

  /**
   * Find matching variant based on user selections
   * @param {Object} selections - { mode: 'single|double', flavors: ['Chocolate', 'Vanilla'] }
   * @returns {Object|null} - Matching variant or null
   */
  findMatchingVariant(selections) {
    if (!selections.mode || !selections.flavors || selections.flavors.length === 0) {
      return null;
    }

    // For single mode, find variant matching the single flavor
    if (selections.mode === 'single' && selections.flavors.length === 1) {
      return this.findVariantByTitle(selections.flavors[0]);
    }

    // For double mode, find variant that matches both flavors or combination
    if (selections.mode === 'double' && selections.flavors.length >= 1) {
      // First try to find exact combination variant
      const combinationVariant = this.findCombinationVariant(selections.flavors);
      if (combinationVariant) {
        return combinationVariant;
      }

      // Fallback: return the first flavor's variant (customize this logic as needed)
      return this.findVariantByTitle(selections.flavors[0]);
    }
    return null;
  }

  /**
   * Find variant by matching title or option values
   * @param {string} flavor - Flavor name
   * @returns {Object|null} - Matching variant
   */
  findVariantByTitle(flavor) {
    return this.variants.find(variant => {
      // Check if variant title contains the flavor
      if (variant.title && variant.title.toLowerCase().includes(flavor.toLowerCase())) {
        return true;
      }

      // Check variant options
      if (variant.options) {
        return variant.options.some(option => option && option.toLowerCase().includes(flavor.toLowerCase()));
      }
      return false;
    }) || null;
  }

  /**
   * Find variant for flavor combination (for double mode)
   * @param {Array} flavors - Array of flavor names
   * @returns {Object|null} - Matching combination variant
   */
  findCombinationVariant(flavors) {
    if (flavors.length < 2) return null;

    // Look for variants that contain both flavors in title or options
    return this.variants.find(variant => {
      const variantText = (variant.title || '').toLowerCase();
      const optionsText = (variant.options || []).join(' ').toLowerCase();
      const searchText = variantText + ' ' + optionsText;
      return flavors.every(flavor => searchText.includes(flavor.toLowerCase()));
    }) || null;
  }

  /**
   * Get cart items to add based on selections
   * For double mode, this determines whether to add one combined item or multiple items
   * @param {Object} selections - User selections
   * @returns {Array} - Array of items to add to cart
   */
  getCartItems(selections) {
    const items = [];

    // Validate selections structure
    if (!selections || !selections.mode || !selections.flavors || !Array.isArray(selections.flavors)) {
      return items;
    }
    if (selections.mode === 'single' && selections.flavors.length >= 1) {
      const variant = this.findVariantByTitle(selections.flavors[0]);
      if (variant) {
        items.push({
          id: variant.id,
          quantity: 1,
          properties: {
            'Purchase Mode': 'Single Subscription',
            'Flavor': selections.flavors[0]
          }
        });
      }
    } else if (selections.mode === 'double') {
      // For double mode, try combination variant first
      const combinationVariant = this.findCombinationVariant(selections.flavors);
      if (combinationVariant) {
        // Add single combination variant
        items.push({
          id: combinationVariant.id,
          quantity: 1,
          properties: {
            'Purchase Mode': 'Double Subscription',
            'Flavors': selections.flavors.join(', ')
          }
        });
      } else {
        // Add separate variants for each flavor
        selections.flavors.forEach((flavor, index) => {
          const variant = this.findVariantByTitle(flavor);
          if (variant) {
            items.push({
              id: variant.id,
              quantity: 1,
              properties: {
                'Purchase Mode': 'Double Subscription',
                'Flavor': flavor,
                'Position': `Flavor ${index + 1}`
              }
            });
          }
        });
      }
    }
    return items;
  }

  /**
   * Validate if current selections are valid
   * @param {Object} selections - User selections
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validateSelections(selections) {
    const errors = [];
    if (!selections.mode) {
      errors.push('Please select a purchase mode');
    }
    if (!selections.flavors || selections.flavors.length === 0) {
      errors.push('Please select at least one flavor');
    }
    if (selections.mode === 'single' && selections.flavors.length !== 1) {
      errors.push('Single mode requires exactly one flavor selection');
    }
    if (selections.mode === 'double' && selections.flavors.length < 2) {
      errors.push('Double mode requires two flavor selections');
    }

    // Check if variants exist for selections
    if (selections.mode && selections.flavors.length > 0) {
      const variant = this.findMatchingVariant(selections);
      if (!variant) {
        errors.push('No product variant available for selected combination');
      } else if (!variant.available) {
        errors.push('Selected variant is currently sold out');
      }
    }
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get all available flavors from product variants
   * @returns {Array} - Array of available flavor names
   */
  getAvailableFlavors() {
    const flavors = new Set();
    const knownFlavors = ['Chocolate', 'Vanilla', 'Orange'];
    this.variants.forEach(variant => {
      knownFlavors.forEach(flavor => {
        const variantText = (variant.title || '').toLowerCase();
        const optionsText = (variant.options || []).join(' ').toLowerCase();
        if (variantText.includes(flavor.toLowerCase()) || optionsText.includes(flavor.toLowerCase())) {
          flavors.add(flavor);
        }
      });
    });
    return Array.from(flavors);
  }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VariantManager;
} else {
  // Make available globally in browser
  window.VariantManager = VariantManager;
}