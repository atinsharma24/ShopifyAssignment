/**
 * CartApi - Handles Shopify Ajax Cart API interactions
 */
class CartApi {
  constructor() {
    this.baseUrl = window.location.origin;
    this.cartUrl = '/cart.js';
    this.addUrl = '/cart/add.js';
    this.updateUrl = '/cart/update.js';
    this.clearUrl = '/cart/clear.js';
  }

  /**
   * Add items to cart
   * @param {Array|Object} items - Items to add (single item or array of items)
   * @returns {Promise} - Promise resolving to cart response
   */
  async addToCart(items) {
    const itemsArray = Array.isArray(items) ? items : [items];
    try {
      // For multiple items, add them one by one to ensure proper handling
      const responses = [];
      for (const item of itemsArray) {
        const response = await this.addSingleItem(item);
        responses.push(response);
      }

      // Return the final cart state
      const finalCart = await this.getCart();

      // Trigger cart update event
      this.triggerCartUpdateEvent(finalCart);
      return {
        success: true,
        cart: finalCart,
        addedItems: responses
      };
    } catch (error) {
      console.error('Failed to add items to cart:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Add a single item to cart
   * @param {Object} item - Item to add { id, quantity, properties }
   * @returns {Promise} - Promise resolving to add response
   */
  async addSingleItem(item) {
    const data = {
      id: item.id,
      quantity: item.quantity || 1,
      ...(item.properties && {
        properties: item.properties
      })
    };
    const response = await fetch(this.addUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.description || `HTTP ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Get current cart state
   * @returns {Promise} - Promise resolving to cart data
   */
  async getCart() {
    try {
      const response = await fetch(this.cartUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get cart:', error);
      throw new Error('Failed to retrieve cart information');
    }
  }

  /**
   * Update cart items
   * @param {Object} updates - Updates object { line_item_key: new_quantity }
   * @returns {Promise} - Promise resolving to updated cart
   */
  async updateCart(updates) {
    try {
      const response = await fetch(this.updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          updates
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      const cart = await response.json();
      this.triggerCartUpdateEvent(cart);
      return cart;
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw new Error('Failed to update cart');
    }
  }

  /**
   * Remove item from cart
   * @param {string} lineItemKey - Line item key to remove
   * @returns {Promise} - Promise resolving to updated cart
   */
  async removeFromCart(lineItemKey) {
    return this.updateCart({
      [lineItemKey]: 0
    });
  }

  /**
   * Clear entire cart
   * @returns {Promise} - Promise resolving to empty cart
   */
  async clearCart() {
    try {
      const response = await fetch(this.clearUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const cart = await response.json();
      this.triggerCartUpdateEvent(cart);
      return cart;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  /**
   * Get cart item count
   * @returns {Promise<number>} - Promise resolving to item count
   */
  async getCartItemCount() {
    try {
      const cart = await this.getCart();
      return cart.item_count || 0;
    } catch (error) {
      console.error('Failed to get cart item count:', error);
      return 0;
    }
  }

  /**
   * Format cart total price
   * @param {Object} cart - Cart object
   * @returns {string} - Formatted price string
   */
  formatCartTotal(cart) {
    if (!cart || typeof cart.total_price !== 'number') {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cart.total_price / 100);
  }

  /**
   * Validate cart items before adding
   * @param {Array|Object} items - Items to validate
   * @returns {Object} - Validation result { valid: boolean, errors: string[] }
   */
  validateCartItems(items) {
    const itemsArray = Array.isArray(items) ? items : [items];
    const errors = [];
    itemsArray.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Item ${index + 1}: Missing variant ID`);
      }
      if (item.quantity && (typeof item.quantity !== 'number' || item.quantity < 1)) {
        errors.push(`Item ${index + 1}: Invalid quantity`);
      }
      if (item.properties && typeof item.properties !== 'object') {
        errors.push(`Item ${index + 1}: Properties must be an object`);
      }
    });
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Find cart line item by variant ID
   * @param {Object} cart - Cart object
   * @param {number} variantId - Variant ID to find
   * @returns {Object|null} - Line item or null
   */
  findLineItemByVariant(cart, variantId) {
    if (!cart || !cart.items) {
      return null;
    }
    return cart.items.find(item => item.variant_id === variantId) || null;
  }

  /**
   * Calculate line item total
   * @param {Object} lineItem - Line item object
   * @returns {number} - Total price in cents
   */
  calculateLineItemTotal(lineItem) {
    if (!lineItem) return 0;
    return lineItem.price * lineItem.quantity;
  }

  /**
   * Trigger custom cart update event
   * @param {Object} cart - Updated cart data
   */
  triggerCartUpdateEvent(cart) {
    const event = new CustomEvent('cart:updated', {
      detail: {
        cart: cart,
        itemCount: cart.item_count || 0,
        totalPrice: cart.total_price || 0
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} - User-friendly error message
   */
  getErrorMessage(error) {
    const message = error.message || 'Unknown error';

    // Map common Shopify errors to user-friendly messages
    const errorMap = {
      'All 1 variant(s) in your cart are unavailable': 'This item is currently unavailable',
      'The variant is unavailable': 'This item is currently unavailable',
      'Not enough inventory': 'Insufficient inventory for this item',
      'This product is unavailable': 'This product is currently unavailable'
    };
    return errorMap[message] || message;
  }

  /**
   * Get cart summary for display
   * @returns {Promise<Object>} - Cart summary object
   */
  async getCartSummary() {
    try {
      const cart = await this.getCart();
      return {
        itemCount: cart.item_count || 0,
        totalPrice: this.formatCartTotal(cart),
        totalPriceCents: cart.total_price || 0,
        items: cart.items || [],
        isEmpty: (cart.item_count || 0) === 0
      };
    } catch (error) {
      console.error('Failed to get cart summary:', error);
      return {
        itemCount: 0,
        totalPrice: '$0.00',
        totalPriceCents: 0,
        items: [],
        isEmpty: true
      };
    }
  }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartApi;
} else {
  // Make available globally in browser
  window.CartApi = CartApi;
}