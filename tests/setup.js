/**
 * Jest test setup file
 * Configures the testing environment and global utilities
 */

// Set up jsdom environment
import 'jest-environment-jsdom';

// Mock Shopify global objects
global.Shopify = {
  theme: {
    name: 'Test Theme'
  },
  shop: 'test-shop.myshopify.com',
  currency: {
    active: 'USD',
    rate: '1.0'
  }
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock window.location
delete window.location;
window.location = {
  origin: 'https://test-shop.myshopify.com',
  pathname: '/products/test-product',
  search: '',
  hash: ''
};

// Create a helper to reset DOM before each test
beforeEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Reset fetch mock
  fetch.mockClear();
  
  // Reset any global variables
  delete window.productData;
  delete window.ProductPage;
  delete window.VariantManager;
  delete window.Pricing;
  delete window.MediaGallery;
  delete window.CartApi;
});

// Helper function to create mock product data
global.createMockProduct = (overrides = {}) => {
  return {
    id: 123456789,
    title: 'Test Protein Drink',
    handle: 'test-protein-drink',
    vendor: 'Test Vendor',
    variants: [
      {
        id: 987654321,
        title: 'Chocolate',
        option1: 'Chocolate',
        option2: null,
        option3: null,
        options: ['Chocolate'],
        price: 2500, // $25.00 in cents
        compare_at_price: 3000,
        available: true,
        featured_image: {
          id: 111,
          src: 'https://example.com/chocolate.jpg'
        }
      },
      {
        id: 987654322,
        title: 'Vanilla',
        option1: 'Vanilla',
        option2: null,
        option3: null,
        options: ['Vanilla'],
        price: 2500,
        compare_at_price: 3000,
        available: true,
        featured_image: {
          id: 222,
          src: 'https://example.com/vanilla.jpg'
        }
      },
      {
        id: 987654323,
        title: 'Orange',
        option1: 'Orange',
        option2: null,
        option3: null,
        options: ['Orange'],
        price: 2500,
        compare_at_price: 3000,
        available: true,
        featured_image: {
          id: 333,
          src: 'https://example.com/orange.jpg'
        }
      }
    ],
    images: [
      {
        id: 111,
        src: 'https://example.com/chocolate.jpg',
        alt: 'Chocolate flavor'
      },
      {
        id: 222,
        src: 'https://example.com/vanilla.jpg',
        alt: 'Vanilla flavor'
      },
      {
        id: 333,
        src: 'https://example.com/orange.jpg',
        alt: 'Orange flavor'
      }
    ],
    media: [
      {
        id: 111,
        media_type: 'image',
        src: 'https://example.com/chocolate.jpg',
        alt: 'Chocolate flavor',
        width: 800,
        height: 600
      },
      {
        id: 222,
        media_type: 'image',
        src: 'https://example.com/vanilla.jpg',
        alt: 'Vanilla flavor',
        width: 800,
        height: 600
      },
      {
        id: 333,
        media_type: 'image',
        src: 'https://example.com/orange.jpg',
        alt: 'Orange flavor',
        width: 800,
        height: 600
      }
    ],
    metafields: {
      subscription: {
        single: {
          value: JSON.stringify({
            title: "What's Included - Single",
            delivery_frequency: "Monthly",
            items: [
              "1 bag of protein powder",
              "Nutrition guide",
              "Recipe book"
            ]
          })
        },
        double: {
          value: JSON.stringify({
            title: "What's Included - Double",
            delivery_frequency: "Monthly",
            items: [
              "2 bags of protein powder",
              "Nutrition guide",
              "Recipe book",
              "Bonus shaker bottle"
            ]
          })
        }
      }
    },
    ...overrides
  };
};

// Helper to create DOM elements for testing
global.createTestDOM = () => {
  document.body.innerHTML = `
    <div class="product">
      <div class="product__media-container">
        <div class="product__media-gallery">
          <div class="product__media-list">
            <div class="product__media-item product__media-item--active" data-media-id="111">
              <img src="https://example.com/chocolate.jpg" alt="Chocolate">
            </div>
            <div class="product__media-item" data-media-id="222">
              <img src="https://example.com/vanilla.jpg" alt="Vanilla">
            </div>
          </div>
          <div class="product__media-thumbnails">
            <button class="product__media-thumbnail product__media-thumbnail--active" data-media-id="111">
              <img src="https://example.com/chocolate-thumb.jpg" alt="Chocolate">
            </button>
            <button class="product__media-thumbnail" data-media-id="222">
              <img src="https://example.com/vanilla-thumb.jpg" alt="Vanilla">
            </button>
          </div>
        </div>
      </div>
      
      <div class="product__details">
        <form data-type="add-to-cart-form">
          <div class="product-form__subscription-mode">
            <input type="radio" id="mode-single" name="purchase_mode" value="single" checked>
            <label for="mode-single">Single</label>
            <input type="radio" id="mode-double" name="purchase_mode" value="double">
            <label for="mode-double">Double</label>
          </div>
          
          <div class="flavor-selector" id="flavor-selector-1">
            <input type="radio" id="flavor-1-chocolate" name="flavor_1" value="Chocolate" checked>
            <label for="flavor-1-chocolate">Chocolate</label>
            <input type="radio" id="flavor-1-vanilla" name="flavor_1" value="Vanilla">
            <label for="flavor-1-vanilla">Vanilla</label>
          </div>
          
          <div class="flavor-selector flavor-selector--hidden" id="flavor-selector-2">
            <input type="radio" id="flavor-2-chocolate" name="flavor_2" value="Chocolate">
            <label for="flavor-2-chocolate">Chocolate</label>
            <input type="radio" id="flavor-2-vanilla" name="flavor_2" value="Vanilla">
            <label for="flavor-2-vanilla">Vanilla</label>
          </div>
          
          <select name="id">
            <option value="987654321">Chocolate</option>
            <option value="987654322">Vanilla</option>
          </select>
          
          <div class="price__container">
            <span data-price-type="main">$20.00</span>
            <span data-price-type="subscription">$15.00</span>
          </div>
          
          <button type="submit" class="product-form__cart-submit">Add to cart</button>
        </form>
        
        <div id="cart-errors-test" class="form__message" hidden></div>
      </div>
    </div>
  `;
};

// Console error and warning suppression for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

global.suppressConsoleErrorsAndWarnings = () => {
  console.error = jest.fn();
  console.warn = jest.fn();
};

global.restoreConsole = () => {
  console.error = originalError;
  console.warn = originalWarn;
};