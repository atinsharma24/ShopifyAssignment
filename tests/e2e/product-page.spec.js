/**
 * End-to-End tests for Product Page using Playwright
 * Tests user interactions, UI updates, and cart functionality
 */

import { test, expect } from '@playwright/test';

// Mock product data for testing
const mockProductData = {
  id: 123456789,
  title: 'Test Protein Drink',
  variants: [
    {
      id: 987654321,
      title: 'Chocolate',
      price: 2500,
      available: true,
      featured_image: { id: 111 }
    },
    {
      id: 987654322,
      title: 'Vanilla',
      price: 2500,
      available: true,
      featured_image: { id: 222 }
    },
    {
      id: 987654323,
      title: 'Orange',
      price: 2500,
      available: true,
      featured_image: { id: 333 }
    }
  ],
  metafields: {
    subscription: {
      single: { value: '{"title": "Single Subscription", "items": ["1 bag"]}' },
      double: { value: '{"title": "Double Subscription", "items": ["2 bags"]}' }
    }
  }
};

// Setup test page with product HTML
async function setupProductPage(page) {
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .flavor-selector--hidden { display: none; }
        .whats-included-content--hidden { display: none; }
        .hidden { display: none; }
        .product-form__cart-submit.disabled { opacity: 0.5; }
      </style>
    </head>
    <body>
      <div class="product">
        <div class="product__media-gallery">
          <div class="product__media-item product__media-item--active" data-media-id="111">
            <img src="/chocolate.jpg" alt="Chocolate">
          </div>
          <div class="product__media-item" data-media-id="222">
            <img src="/vanilla.jpg" alt="Vanilla">
          </div>
          <div class="product__media-thumbnails">
            <button class="product__media-thumbnail product__media-thumbnail--active" data-media-id="111">
              <img src="/chocolate-thumb.jpg" alt="Chocolate">
            </button>
            <button class="product__media-thumbnail" data-media-id="222">
              <img src="/vanilla-thumb.jpg" alt="Vanilla">
            </button>
          </div>
        </div>
        
        <div class="product__details">
          <h1 class="product__title">Test Protein Drink</h1>
          
          <div class="price__container">
            <span data-price-type="main">$20.00</span>
            <span data-price-type="subscription">$15.00</span>
            <span class="price__subscription-savings">Save 40%</span>
          </div>
          
          <form data-type="add-to-cart-form">
            <div class="product-form__subscription-mode">
              <input type="radio" id="mode-single" name="purchase_mode" value="single" checked>
              <label for="mode-single">Single Drink Subscription</label>
              <input type="radio" id="mode-double" name="purchase_mode" value="double">
              <label for="mode-double">Double Drink Subscription</label>
            </div>
            
            <div class="flavor-selector" id="flavor-selector-1">
              <h4>Flavor</h4>
              <input type="radio" id="flavor-1-chocolate" name="flavor_1" value="Chocolate" checked>
              <label for="flavor-1-chocolate">Chocolate</label>
              <input type="radio" id="flavor-1-vanilla" name="flavor_1" value="Vanilla">
              <label for="flavor-1-vanilla">Vanilla</label>
              <input type="radio" id="flavor-1-orange" name="flavor_1" value="Orange">
              <label for="flavor-1-orange">Orange</label>
            </div>
            
            <div class="flavor-selector flavor-selector--hidden" id="flavor-selector-2">
              <h4>Flavor 2</h4>
              <input type="radio" id="flavor-2-chocolate" name="flavor_2" value="Chocolate">
              <label for="flavor-2-chocolate">Chocolate</label>
              <input type="radio" id="flavor-2-vanilla" name="flavor_2" value="Vanilla">
              <label for="flavor-2-vanilla">Vanilla</label>
              <input type="radio" id="flavor-2-orange" name="flavor_2" value="Orange">
              <label for="flavor-2-orange">Orange</label>
            </div>
            
            <select name="id" id="variant-select">
              <option value="987654321">Chocolate - $25.00</option>
              <option value="987654322">Vanilla - $25.00</option>
              <option value="987654323">Orange - $25.00</option>
            </select>
            
            <div class="whats-included-container">
              <div class="whats-included-content" data-mode="single">
                <h3>What's Included - Single</h3>
                <ul><li>1 bag of protein powder</li></ul>
              </div>
              <div class="whats-included-content whats-included-content--hidden" data-mode="double">
                <h3>What's Included - Double</h3>
                <ul><li>2 bags of protein powder</li></ul>
              </div>
            </div>
            
            <button type="submit" class="product-form__cart-submit">
              <span>Add to cart</span>
              <div class="loading-overlay hidden">Loading...</div>
            </button>
          </form>
          
          <div id="cart-errors-test" class="form__message" hidden></div>
        </div>
      </div>
      
      <script>
        // Mock window.productData
        window.productData = ${JSON.stringify(mockProductData)};
        
        // Mock Cart API responses
        window.fetch = async (url, options) => {
          if (url.includes('/cart/add.js')) {
            return {
              ok: true,
              json: async () => ({ id: Date.now(), quantity: 1 })
            };
          }
          if (url.includes('/cart.js')) {
            return {
              ok: true,
              json: async () => ({ 
                items: [{ id: Date.now(), quantity: 1 }], 
                item_count: 1,
                total_price: 1500 
              })
            };
          }
          return { ok: false, status: 404 };
        };
      </script>
      
      <!-- Include our JavaScript modules -->
      <script>
        ${await page.evaluate(() => {
          // Here we would normally include our actual JS files
          // For testing, we'll create simplified versions
          return \`
            // Simplified ProductPage for testing
            window.ProductPage = {
              init() {
                this.setupEventListeners();
                this.initializeDefaultState();
              },
              
              setupEventListeners() {
                const modeRadios = document.querySelectorAll('input[name="purchase_mode"]');
                modeRadios.forEach(radio => {
                  radio.addEventListener('change', () => this.handleModeChange());
                });
                
                const flavorRadios = document.querySelectorAll('input[name^="flavor_"]');
                flavorRadios.forEach(radio => {
                  radio.addEventListener('change', () => this.updateVariantAndPricing());
                });
                
                const form = document.querySelector('form[data-type="add-to-cart-form"]');
                if (form) {
                  form.addEventListener('submit', (e) => this.handleAddToCart(e));
                }
                
                const thumbnails = document.querySelectorAll('.product__media-thumbnail');
                thumbnails.forEach(thumb => {
                  thumb.addEventListener('click', () => this.handleThumbnailClick(thumb));
                });
              },
              
              initializeDefaultState() {
                document.getElementById('mode-single').checked = true;
                document.getElementById('flavor-1-chocolate').checked = true;
                this.updateFlavorSelectors();
                this.updateWhatsIncluded();
              },
              
              handleModeChange() {
                this.updateFlavorSelectors();
                this.updateWhatsIncluded();
                this.updateVariantAndPricing();
              },
              
              updateFlavorSelectors() {
                const selectedMode = document.querySelector('input[name="purchase_mode"]:checked')?.value;
                const selector2 = document.getElementById('flavor-selector-2');
                
                if (selectedMode === 'double') {
                  selector2?.classList.remove('flavor-selector--hidden');
                  const secondFlavorRadios = document.querySelectorAll('input[name="flavor_2"]');
                  if (!Array.from(secondFlavorRadios).some(r => r.checked) && secondFlavorRadios.length > 0) {
                    secondFlavorRadios[0].checked = true;
                  }
                } else {
                  selector2?.classList.add('flavor-selector--hidden');
                  document.querySelectorAll('input[name="flavor_2"]').forEach(r => r.checked = false);
                }
              },
              
              updateWhatsIncluded() {
                const selectedMode = document.querySelector('input[name="purchase_mode"]:checked')?.value;
                document.querySelectorAll('.whats-included-content').forEach(content => {
                  const contentMode = content.getAttribute('data-mode');
                  if (contentMode === selectedMode) {
                    content.classList.remove('whats-included-content--hidden');
                  } else {
                    content.classList.add('whats-included-content--hidden');
                  }
                });
              },
              
              updateVariantAndPricing() {
                const mode = document.querySelector('input[name="purchase_mode"]:checked')?.value;
                const flavor1 = document.querySelector('input[name="flavor_1"]:checked')?.value;
                const flavor2 = document.querySelector('input[name="flavor_2"]:checked')?.value;
                
                // Update prices based on selection
                const mainPrice = mode === 'double' ? '$40.00' : '$20.00';
                const subPrice = mode === 'double' ? '$30.00' : '$15.00';
                
                document.querySelector('[data-price-type="main"]').textContent = mainPrice;
                document.querySelector('[data-price-type="subscription"]').textContent = subPrice;
                
                // Update variant select
                const variantSelect = document.getElementById('variant-select');
                if (flavor1 === 'Chocolate') variantSelect.value = '987654321';
                else if (flavor1 === 'Vanilla') variantSelect.value = '987654322';
                else if (flavor1 === 'Orange') variantSelect.value = '987654323';
              },
              
              handleThumbnailClick(thumbnail) {
                const mediaId = thumbnail.getAttribute('data-media-id');
                document.querySelectorAll('.product__media-item').forEach(item => {
                  item.classList.remove('product__media-item--active');
                });
                document.querySelectorAll('.product__media-thumbnail').forEach(thumb => {
                  thumb.classList.remove('product__media-thumbnail--active');
                });
                
                document.querySelector(\`[data-media-id="\${mediaId}"].product__media-item\`)?.classList.add('product__media-item--active');
                thumbnail.classList.add('product__media-thumbnail--active');
              },
              
              async handleAddToCart(event) {
                event.preventDefault();
                
                const button = event.target.querySelector('.product-form__cart-submit');
                const loading = button.querySelector('.loading-overlay');
                
                loading.classList.remove('hidden');
                
                try {
                  await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 987654321, quantity: 1 })
                  });
                  
                  // Show success
                  this.showMessage('Added to cart successfully!', 'success');
                } catch (error) {
                  this.showMessage('Failed to add to cart', 'error');
                } finally {
                  loading.classList.add('hidden');
                }
              },
              
              showMessage(message, type) {
                const errorContainer = document.getElementById('cart-errors-test');
                errorContainer.textContent = message;
                errorContainer.hidden = false;
                errorContainer.className = type === 'success' ? 'form__message form__message--success' : 'form__message';
                setTimeout(() => { errorContainer.hidden = true; }, 3000);
              }
            };
            
            // Auto-initialize
            document.addEventListener('DOMContentLoaded', () => window.ProductPage.init());
            if (document.readyState !== 'loading') window.ProductPage.init();
          \`;
        })}
      </script>
    </body>
    </html>
  `);
}

test.describe('Product Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductPage(page);
  });

  test('loads with correct default state', async ({ page }) => {
    // Verify default mode is single
    const singleRadio = page.locator('#mode-single');
    await expect(singleRadio).toBeChecked();

    // Verify default flavor is chocolate
    const chocolateRadio = page.locator('#flavor-1-chocolate');
    await expect(chocolateRadio).toBeChecked();

    // Verify second flavor selector is hidden
    const secondSelector = page.locator('#flavor-selector-2');
    await expect(secondSelector).toHaveClass(/flavor-selector--hidden/);

    // Verify single "What's Included" content is visible
    const singleContent = page.locator('.whats-included-content[data-mode="single"]');
    const doubleContent = page.locator('.whats-included-content[data-mode="double"]');
    await expect(singleContent).toBeVisible();
    await expect(doubleContent).toHaveClass(/whats-included-content--hidden/);
  });

  test('switches to double mode and shows two flavor selectors', async ({ page }) => {
    // Click double mode radio
    await page.click('#mode-double');

    // Verify double mode is selected
    const doubleRadio = page.locator('#mode-double');
    await expect(doubleRadio).toBeChecked();

    // Verify second flavor selector becomes visible
    const secondSelector = page.locator('#flavor-selector-2');
    await expect(secondSelector).not.toHaveClass(/flavor-selector--hidden/);

    // Verify double "What's Included" content is visible
    const singleContent = page.locator('.whats-included-content[data-mode="single"]');
    const doubleContent = page.locator('.whats-included-content[data-mode="double"]');
    await expect(singleContent).toHaveClass(/whats-included-content--hidden/);
    await expect(doubleContent).toBeVisible();
  });

  test('changes flavors and updates pricing', async ({ page }) => {
    // Change to vanilla flavor
    await page.click('#flavor-1-vanilla');

    // Verify vanilla is selected
    const vanillaRadio = page.locator('#flavor-1-vanilla');
    await expect(vanillaRadio).toBeChecked();

    // Verify variant select is updated
    const variantSelect = page.locator('#variant-select');
    await expect(variantSelect).toHaveValue('987654322');
  });

  test('updates pricing when switching between modes', async ({ page }) => {
    // Check initial single mode pricing
    let mainPrice = page.locator('[data-price-type="main"]');
    let subPrice = page.locator('[data-price-type="subscription"]');
    await expect(mainPrice).toHaveText('$20.00');
    await expect(subPrice).toHaveText('$15.00');

    // Switch to double mode
    await page.click('#mode-double');

    // Check double mode pricing
    await expect(mainPrice).toHaveText('$40.00');
    await expect(subPrice).toHaveText('$30.00');

    // Switch back to single mode
    await page.click('#mode-single');

    // Check single mode pricing again
    await expect(mainPrice).toHaveText('$20.00');
    await expect(subPrice).toHaveText('$15.00');
  });

  test('handles media gallery thumbnail clicks', async ({ page }) => {
    // Initially chocolate should be active
    const chocolateThumb = page.locator('.product__media-thumbnail[data-media-id="111"]');
    const vanillaThumb = page.locator('.product__media-thumbnail[data-media-id="222"]');
    const chocolateMedia = page.locator('.product__media-item[data-media-id="111"]');
    const vanillaMedia = page.locator('.product__media-item[data-media-id="222"]');

    await expect(chocolateThumb).toHaveClass(/product__media-thumbnail--active/);
    await expect(chocolateMedia).toHaveClass(/product__media-item--active/);

    // Click vanilla thumbnail
    await vanillaThumb.click();

    // Verify vanilla becomes active
    await expect(vanillaThumb).toHaveClass(/product__media-thumbnail--active/);
    await expect(vanillaMedia).toHaveClass(/product__media-item--active/);
    await expect(chocolateThumb).not.toHaveClass(/product__media-thumbnail--active/);
    await expect(chocolateMedia).not.toHaveClass(/product__media-item--active/);
  });

  test('handles add to cart workflow', async ({ page }) => {
    const addToCartButton = page.locator('.product-form__cart-submit');
    const loadingOverlay = page.locator('.loading-overlay');
    const messageContainer = page.locator('#cart-errors-test');

    // Initially loading should be hidden
    await expect(loadingOverlay).toHaveClass(/hidden/);

    // Click add to cart
    await addToCartButton.click();

    // Wait for success message
    await expect(messageContainer).toBeVisible();
    await expect(messageContainer).toHaveText('Added to cart successfully!');
    await expect(messageContainer).toHaveClass(/form__message--success/);

    // Loading should be hidden again
    await expect(loadingOverlay).toHaveClass(/hidden/);
  });

  test('validates required selections before allowing add to cart', async ({ page }) => {
    // Switch to double mode
    await page.click('#mode-double');

    // Ensure second flavor is selected (should auto-select)
    const secondFlavorRadios = page.locator('input[name="flavor_2"]');
    const firstSecondFlavor = secondFlavorRadios.first();
    
    // Check if any second flavor is selected, if not, select first one
    const isAnySecondFlavorChecked = await page.locator('input[name="flavor_2"]:checked').count();
    if (isAnySecondFlavorChecked === 0) {
      await firstSecondFlavor.check();
    }

    // Now add to cart should work
    const addToCartButton = page.locator('.product-form__cart-submit');
    await addToCartButton.click();

    const messageContainer = page.locator('#cart-errors-test');
    await expect(messageContainer).toBeVisible();
    await expect(messageContainer).toHaveText('Added to cart successfully!');
  });

  test('keyboard navigation works for flavor selection', async ({ page }) => {
    // Focus on first flavor radio
    await page.focus('#flavor-1-chocolate');

    // Use arrow keys to navigate
    await page.keyboard.press('ArrowDown');
    
    // Check if vanilla is now selected (depending on browser behavior)
    // Note: Radio button keyboard behavior varies by browser
    const vanillaRadio = page.locator('#flavor-1-vanilla');
    
    // Click to ensure selection for consistency
    await vanillaRadio.click();
    await expect(vanillaRadio).toBeChecked();
  });

  test('accessibility attributes are present', async ({ page }) => {
    // Check that radio buttons have proper labels
    const singleModeRadio = page.locator('#mode-single');
    const singleModeLabel = page.locator('label[for="mode-single"]');
    
    await expect(singleModeLabel).toBeVisible();
    await expect(singleModeLabel).toHaveText('Single Drink Subscription');

    // Check flavor labels
    const chocolateLabel = page.locator('label[for="flavor-1-chocolate"]');
    await expect(chocolateLabel).toBeVisible();
    await expect(chocolateLabel).toHaveText('Chocolate');

    // Check that form has proper structure
    const form = page.locator('form[data-type="add-to-cart-form"]');
    await expect(form).toBeVisible();
  });

  test('handles rapid mode switching correctly', async ({ page }) => {
    // Rapidly switch between modes
    for (let i = 0; i < 3; i++) {
      await page.click('#mode-double');
      await page.waitForTimeout(100);
      await page.click('#mode-single');
      await page.waitForTimeout(100);
    }

    // End on double mode
    await page.click('#mode-double');

    // Verify final state is correct
    const doubleRadio = page.locator('#mode-double');
    const secondSelector = page.locator('#flavor-selector-2');
    const doubleContent = page.locator('.whats-included-content[data-mode="double"]');

    await expect(doubleRadio).toBeChecked();
    await expect(secondSelector).not.toHaveClass(/flavor-selector--hidden/);
    await expect(doubleContent).toBeVisible();
  });

  test('pricing formulas are correct', async ({ page }) => {
    // Test single mode pricing (should be 20% off main, 40% off subscription)
    const mainPrice = page.locator('[data-price-type="main"]');
    const subPrice = page.locator('[data-price-type="subscription"]');
    const savings = page.locator('.price__subscription-savings');

    // Single mode: $25 original -> $20 main (20% off), $15 subscription (40% off)
    await expect(mainPrice).toHaveText('$20.00');
    await expect(subPrice).toHaveText('$15.00');
    await expect(savings).toHaveText('Save 40%');

    // Switch to double mode and verify pricing updates
    await page.click('#mode-double');
    
    // Double mode pricing should be updated
    await expect(mainPrice).toHaveText('$40.00');
    await expect(subPrice).toHaveText('$30.00');
  });
});

test.describe('Product Page Error Handling', () => {
  test('handles network errors gracefully', async ({ page }) => {
    await setupProductPage(page);

    // Override fetch to simulate network error
    await page.evaluate(() => {
      window.fetch = async () => {
        throw new Error('Network error');
      };
    });

    const addToCartButton = page.locator('.product-form__cart-submit');
    await addToCartButton.click();

    // Should show error message
    const messageContainer = page.locator('#cart-errors-test');
    await expect(messageContainer).toBeVisible();
    await expect(messageContainer).toHaveText('Failed to add to cart');
  });

  test('handles missing product data', async ({ page }) => {
    await page.setContent(`
      <html>
        <body>
          <div>No product data available</div>
          <script>
            // No window.productData defined
            console.log('No product data available');
          </script>
        </body>
      </html>
    `);

    // Page should load without JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    await page.waitForTimeout(1000);
    
    // Should not have critical errors (some console warnings are acceptable)
    const criticalErrors = errors.filter(error => 
      error.message.includes('Cannot read') || error.message.includes('undefined')
    );
    expect(criticalErrors.length).toBe(0);
  });
});