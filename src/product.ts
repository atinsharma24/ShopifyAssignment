/**
 * Product Page Main TypeScript Module
 * 
 * This file orchestrates all product page functionality including:
 * - Variant selection and mapping
 * - Price calculations and display updates
 * - Media gallery interactions
 * - Cart API integration
 * - Form validation and error handling
 */

import { VariantManager } from './ui/variant-manager';
import { PricingManager } from './ui/pricing';
import { MediaGallery } from './ui/media-gallery';
import { CartAPI } from './ui/cart-api';
import type { 
  ShopifyProduct, 
  ShopifyProductVariant,
  SelectionInput 
} from './types/shopify';

interface ProductState {
  purchaseMode: 'single' | 'double';
  flavors: {
    single: string;
    1: string;
    2: string;
  };
  selectedVariant: ShopifyProductVariant | null;
  isLoading: boolean;
}

interface ProductElements {
  modeRadios: NodeListOf<HTMLInputElement>;
  singleFlavorSelector: HTMLElement | null;
  doubleFlavorSelector: HTMLElement | null;
  flavorInputs: NodeListOf<HTMLInputElement>;
  priceDisplay: HTMLElement | null;
  mainPrice: HTMLElement | null;
  subscriptionPrice: HTMLElement | null;
  includedSingle: HTMLElement | null;
  includedDouble: HTMLElement | null;
  variantIdInput: HTMLInputElement | null;
  addToCartBtn: HTMLElement | null;
  productForm: HTMLFormElement | null;
  errorMessage: HTMLElement | null;
  successMessage: HTMLElement | null;
}

/**
 * Main Product Manager Class
 * Coordinates all product page functionality
 */
export class ProductManager {
  private readonly productData: ShopifyProduct;
  private readonly variantManager: VariantManager;
  private readonly pricingManager: PricingManager;
  private readonly mediaGallery: MediaGallery;
  private readonly cartAPI: CartAPI;
  private currentState: ProductState;
  private elements: ProductElements;

  constructor(productData: ShopifyProduct) {
    this.productData = productData;
    this.variantManager = new VariantManager(productData);
    this.pricingManager = new PricingManager();
    this.mediaGallery = new MediaGallery();
    this.cartAPI = new CartAPI();
    
    // State management
    this.currentState = {
      purchaseMode: 'single',
      flavors: {
        single: 'Chocolate',
        1: 'Chocolate',
        2: 'Vanilla'
      },
      selectedVariant: null,
      isLoading: false
    };

    // Initialize elements object
    this.elements = {} as ProductElements;
  }

  /**
   * Initialize the product page
   */
  public init(): void {
    this.cacheElements();
    this.bindEvents();
    this.setInitialState();
    this.updateDisplay();
    
    console.log('Product page initialized', this.productData);
  }

  /**
   * Cache frequently used DOM elements
   */
  private cacheElements(): void {
    this.elements = {
      // Mode selection
      modeRadios: document.querySelectorAll<HTMLInputElement>('input[name="purchase_mode"]'),
      
      // Flavor selectors
      singleFlavorSelector: document.querySelector('.flavor-selector.single-flavor'),
      doubleFlavorSelector: document.querySelector('.flavor-selector.double-flavor'),
      flavorInputs: document.querySelectorAll<HTMLInputElement>('.flavor-input'),
      
      // Price display
      priceDisplay: document.querySelector('[data-price-display]'),
      mainPrice: document.querySelector('[data-main-price]'),
      subscriptionPrice: document.querySelector('[data-subscription-price]'),
      
      // What's included
      includedSingle: document.querySelector('.included-single'),
      includedDouble: document.querySelector('.included-double'),
      
      // Form elements
      variantIdInput: document.getElementById('variant-id') as HTMLInputElement,
      addToCartBtn: document.querySelector('[data-add-to-cart]'),
      productForm: document.querySelector('.product-form') as HTMLFormElement,
      
      // Error/success messages
      errorMessage: document.getElementById('cart-errors'),
      successMessage: document.getElementById('cart-success')
    };
  }

  /**
   * Bind event listeners
   */
  private bindEvents(): void {
    // Purchase mode change
    this.elements.modeRadios.forEach(radio => {
      radio.addEventListener('change', this.handleModeChange.bind(this));
    });

    // Flavor selection change
    this.elements.flavorInputs.forEach(input => {
      input.addEventListener('change', this.handleFlavorChange.bind(this));
    });

    // Add to cart
    if (this.elements.addToCartBtn) {
      this.elements.addToCartBtn.addEventListener('click', this.handleAddToCart.bind(this));
    }

    // Form submission
    if (this.elements.productForm) {
      this.elements.productForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    }
  }

  /**
   * Set initial state based on URL parameters or defaults
   */
  private setInitialState(): void {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set mode from URL or default
    const mode = urlParams.get('mode') as 'single' | 'double' || 'single';
    this.currentState.purchaseMode = mode;
    
    // Set flavors from URL or defaults
    if (mode === 'single') {
      this.currentState.flavors.single = urlParams.get('flavor') || 'Chocolate';
    } else {
      this.currentState.flavors[1] = urlParams.get('flavor1') || 'Chocolate';
      this.currentState.flavors[2] = urlParams.get('flavor2') || 'Vanilla';
    }

    // Find and set initial variant
    this.updateSelectedVariant();
  }

  /**
   * Handle purchase mode change
   */
  private handleModeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newMode = target.value as 'single' | 'double';
    
    if (newMode !== this.currentState.purchaseMode) {
      this.currentState.purchaseMode = newMode;
      this.updateDisplay();
      this.updateSelectedVariant();
    }
  }

  /**
   * Handle flavor selection change
   */
  private handleFlavorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const flavorType = target.dataset.flavorType;
    const flavorValue = target.value;

    if (flavorType === 'single') {
      this.currentState.flavors.single = flavorValue;
    } else if (flavorType === 'double-1') {
      this.currentState.flavors[1] = flavorValue;
    } else if (flavorType === 'double-2') {
      this.currentState.flavors[2] = flavorValue;
    }

    this.updateSelectedVariant();
    this.updatePricing();
  }

  /**
   * Handle add to cart button click
   */
  private async handleAddToCart(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.currentState.selectedVariant) {
      this.showError('Please select a valid product variant');
      return;
    }

    await this.addToCart();
  }

  /**
   * Handle form submission
   */
  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await this.addToCart();
  }

  /**
   * Update selected variant based on current state
   */
  private updateSelectedVariant(): void {
    const selections = this.getCurrentSelections();
    const variant = this.variantManager.findVariant(selections);
    
    this.currentState.selectedVariant = variant;
    
    // Update variant ID in form
    if (this.elements.variantIdInput && variant) {
      this.elements.variantIdInput.value = variant.id.toString();
    }

    this.updateAddToCartButton();
  }

  /**
   * Get current selections based on state
   */
  private getCurrentSelections(): SelectionInput {
    if (this.currentState.purchaseMode === 'single') {
      return {
        mode: 'single',
        flavor: this.currentState.flavors.single
      };
    } else {
      return {
        mode: 'double',
        flavor1: this.currentState.flavors[1],
        flavor2: this.currentState.flavors[2]
      };
    }
  }

  /**
   * Update all display elements
   */
  private updateDisplay(): void {
    this.updateModeDisplay();
    this.updateFlavorDisplay();
    this.updatePricing();
    this.updateIncludedItems();
    this.updateAddToCartButton();
  }

  /**
   * Update mode display
   */
  private updateModeDisplay(): void {
    this.elements.modeRadios.forEach(radio => {
      radio.checked = radio.value === this.currentState.purchaseMode;
    });
  }

  /**
   * Update flavor display
   */
  private updateFlavorDisplay(): void {
    // Show/hide appropriate flavor selectors
    if (this.elements.singleFlavorSelector) {
      this.elements.singleFlavorSelector.style.display = 
        this.currentState.purchaseMode === 'single' ? 'block' : 'none';
    }
    
    if (this.elements.doubleFlavorSelector) {
      this.elements.doubleFlavorSelector.style.display = 
        this.currentState.purchaseMode === 'double' ? 'block' : 'none';
    }

    // Update selected flavor inputs
    this.elements.flavorInputs.forEach(input => {
      const flavorType = input.dataset.flavorType;
      
      if (flavorType === 'single') {
        input.checked = input.value === this.currentState.flavors.single;
      } else if (flavorType === 'double-1') {
        input.checked = input.value === this.currentState.flavors[1];
      } else if (flavorType === 'double-2') {
        input.checked = input.value === this.currentState.flavors[2];
      }
    });
  }

  /**
   * Update pricing display
   */
  private updatePricing(): void {
    if (!this.currentState.selectedVariant) return;

    const variant = this.currentState.selectedVariant;
    const prices = this.pricingManager.calculatePrices(variant.price || 0);
    this.pricingManager.updateDisplay(prices, this.currentState.purchaseMode);
  }

  /**
   * Update included items display
   */
  private updateIncludedItems(): void {
    if (this.elements.includedSingle) {
      this.elements.includedSingle.style.display = 
        this.currentState.purchaseMode === 'single' ? 'block' : 'none';
    }
    
    if (this.elements.includedDouble) {
      this.elements.includedDouble.style.display = 
        this.currentState.purchaseMode === 'double' ? 'block' : 'none';
    }
  }

  /**
   * Update add to cart button state
   */
  private updateAddToCartButton(): void {
    if (!this.elements.addToCartBtn) return;

    const isValid = this.validateCurrentSelection();
    const isAvailable = this.currentState.selectedVariant?.available === true;
    
    this.elements.addToCartBtn.classList.toggle('disabled', !isValid || !isAvailable);
    
    if (this.elements.addToCartBtn instanceof HTMLButtonElement) {
      this.elements.addToCartBtn.disabled = !isValid || !isAvailable;
    }
  }

  /**
   * Validate current selection
   */
  private validateCurrentSelection(): boolean {
    const selections = this.getCurrentSelections();
    const validation = this.variantManager.validateSelections(selections);
    return validation.isValid;
  }

  /**
   * Add product to cart
   */
  private async addToCart(): Promise<void> {
    if (!this.currentState.selectedVariant) {
      this.showError('Please select a valid product variant');
      return;
    }

    this.setLoading(true);
    this.clearMessages();

    try {
      await this.cartAPI.addToCart({
        id: this.currentState.selectedVariant.id,
        quantity: 1
      });

      this.showSuccess('Product added to cart successfully!');
    } catch (error) {
      console.error('Add to cart error:', error);
      this.showError('Failed to add product to cart. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.currentState.isLoading = loading;
    
    if (this.elements.addToCartBtn) {
      this.elements.addToCartBtn.classList.toggle('loading', loading);
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.style.display = 'block';
    }
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    if (this.elements.successMessage) {
      this.elements.successMessage.textContent = message;
      this.elements.successMessage.style.display = 'block';
    }
  }

  /**
   * Clear all messages
   */
  private clearMessages(): void {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.style.display = 'none';
    }
    
    if (this.elements.successMessage) {
      this.elements.successMessage.style.display = 'none';
    }
  }

  /**
   * Get current state (for debugging/testing)
   */
  public getCurrentState(): ProductState {
    return { ...this.currentState };
  }

  /**
   * Get current variant (for debugging/testing)
   */
  public getCurrentVariant(): ShopifyProductVariant | null {
    return this.currentState.selectedVariant;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const productDataElement = document.querySelector('[data-product]');
  
  if (productDataElement) {
    try {
      const productData = JSON.parse(productDataElement.textContent || '{}');
      const productManager = new ProductManager(productData);
      productManager.init();
      
      // Make available globally for debugging
      (window as unknown as Record<string, unknown>).productManager = productManager;
    } catch (error) {
      console.error('Failed to initialize product page:', error);
    }
  }
});