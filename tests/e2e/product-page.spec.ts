/**
 * Product Page End-to-End Tests
 * 
 * Tests complete user workflows on the product page including:
 * - Mode selection and flavor changes
 * - Price updates and calculations
 * - Add to cart functionality
 * - UI state management
 */

import { test, expect } from '@playwright/test';

test.describe('Product Page', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to product page - adjust URL based on your test environment
    await page.goto('/products/test-subscription-product');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Ensure product data is loaded
    await page.waitForSelector('[data-product]');
  });

  test.describe('Initial State', () => {
    test('should load with correct default selections', async ({ page }) => {
      // Check that Single mode is selected by default
      const singleModeRadio = page.locator('#mode-single');
      await expect(singleModeRadio).toBeChecked();

      // Check that Double mode is not selected
      const doubleModeRadio = page.locator('#mode-double');
      await expect(doubleModeRadio).not.toBeChecked();

      // Check default flavor selection
      const chocolateOption = page.locator('#single-flavor-chocolate');
      await expect(chocolateOption).toBeChecked();

      // Verify pricing elements are visible
      await expect(page.locator('[data-main-price]')).toBeVisible();
      await expect(page.locator('[data-subscription-price]')).toBeVisible();
    });

    test('should display correct initial pricing', async ({ page }) => {
      // Test that initial prices are displayed
      const mainPrice = page.locator('[data-main-price]');
      const subscriptionPrice = page.locator('[data-subscription-price]');

      await expect(mainPrice).toContainText('$');
      await expect(subscriptionPrice).toContainText('$');

      // Verify subscription price is lower than main price
      const mainPriceText = await mainPrice.textContent();
      const subscriptionPriceText = await subscriptionPrice.textContent();

      const mainAmount = parseFloat(mainPriceText?.replace(/[$,]/g, '') || '0');
      const subscriptionAmount = parseFloat(subscriptionPriceText?.replace(/[$,]/g, '') || '0');

      expect(subscriptionAmount).toBeLessThan(mainAmount);
    });

    test('should have all required elements visible', async ({ page }) => {
      // Mode selection
      await expect(page.locator('#mode-single')).toBeVisible();
      await expect(page.locator('#mode-double')).toBeVisible();

      // Single mode flavors
      await expect(page.locator('#single-flavor-chocolate')).toBeVisible();
      await expect(page.locator('#single-flavor-vanilla')).toBeVisible();
      await expect(page.locator('#single-flavor-orange')).toBeVisible();

      // Add to cart button
      await expect(page.locator('#add-to-cart')).toBeVisible();
      await expect(page.locator('#add-to-cart')).toBeEnabled();

      // Pricing elements
      await expect(page.locator('[data-main-price]')).toBeVisible();
      await expect(page.locator('[data-subscription-price]')).toBeVisible();
    });
  });

  test.describe('Mode Selection', () => {
    test('should switch to double mode correctly', async ({ page }) => {
      // Click double mode
      await page.click('#mode-double');

      // Verify double mode is selected
      await expect(page.locator('#mode-double')).toBeChecked();
      await expect(page.locator('#mode-single')).not.toBeChecked();

      // Verify double mode flavors are visible
      await expect(page.locator('#double-flavor1-chocolate')).toBeVisible();
      await expect(page.locator('#double-flavor2-vanilla')).toBeVisible();

      // Verify single mode flavors are hidden
      await expect(page.locator('#single-flavors')).toHaveClass(/hidden/);
    });

    test('should switch back to single mode correctly', async ({ page }) => {
      // Start with double mode
      await page.click('#mode-double');
      await expect(page.locator('#mode-double')).toBeChecked();

      // Switch back to single mode
      await page.click('#mode-single');

      // Verify single mode is selected
      await expect(page.locator('#mode-single')).toBeChecked();
      await expect(page.locator('#mode-double')).not.toBeChecked();

      // Verify single mode flavors are visible
      await expect(page.locator('#single-flavors')).toBeVisible();
      await expect(page.locator('#single-flavors')).not.toHaveClass(/hidden/);
    });

    test('should update pricing when switching modes', async ({ page }) => {
      // Get initial single mode price
      const initialPrice = await page.locator('[data-main-price]').textContent();

      // Switch to double mode
      await page.click('#mode-double');

      // Wait for price update
      await page.waitForFunction(
        (initialPriceText) => {
          const currentPrice = document.querySelector('[data-main-price]')?.textContent;
          return currentPrice !== initialPriceText;
        },
        initialPrice
      );

      // Verify price has changed
      const newPrice = await page.locator('[data-main-price]').textContent();
      expect(newPrice).not.toBe(initialPrice);
    });
  });

  test.describe('Flavor Selection', () => {
    test('should select different single flavors', async ({ page }) => {
      const flavors = ['vanilla', 'orange'];

      for (const flavor of flavors) {
        await page.click(`#single-flavor-${flavor}`);
        await expect(page.locator(`#single-flavor-${flavor}`)).toBeChecked();

        // Wait for price update
        await page.waitForTimeout(300);

        // Verify pricing update occurs
        await expect(page.locator('[data-main-price]')).toBeVisible();
      }
    });

    test('should select double mode flavor combinations', async ({ page }) => {
      // Switch to double mode
      await page.click('#mode-double');

      // Test different flavor combinations
      const combinations = [
        { flavor1: 'chocolate', flavor2: 'vanilla' },
        { flavor1: 'vanilla', flavor2: 'orange' },
        { flavor1: 'chocolate', flavor2: 'orange' }
      ];

      for (const combo of combinations) {
        await page.click(`#double-flavor1-${combo.flavor1}`);
        await page.click(`#double-flavor2-${combo.flavor2}`);

        await expect(page.locator(`#double-flavor1-${combo.flavor1}`)).toBeChecked();
        await expect(page.locator(`#double-flavor2-${combo.flavor2}`)).toBeChecked();

        // Wait for updates
        await page.waitForTimeout(300);
      }
    });

    test('should prevent same flavor selection in double mode', async ({ page }) => {
      // Switch to double mode
      await page.click('#mode-double');

      // Select chocolate for first flavor
      await page.click('#double-flavor1-chocolate');

      // Try to select chocolate for second flavor
      await page.click('#double-flavor2-chocolate');

      // Verify validation prevents same flavor selection
      // This might disable the add to cart button or show an error
      const addToCartButton = page.locator('#add-to-cart');
      await expect(addToCartButton).toBeDisabled();
    });
  });

  test.describe('Pricing Updates', () => {
    test('should display per-serving pricing correctly', async ({ page }) => {
      await expect(page.locator('[data-per-serving-price]')).toBeVisible();

      const perServingPrice = await page.locator('[data-per-serving-price]').textContent();
      expect(perServingPrice).toContain('$');
      expect(perServingPrice).toMatch(/\d+\.\d{2}/);
    });

    test('should show price breakdown', async ({ page }) => {
      // Check if price breakdown elements exist
      await expect(page.locator('[data-breakdown-base]')).toBeVisible();
      await expect(page.locator('[data-breakdown-subscription]')).toBeVisible();
      await expect(page.locator('[data-breakdown-sitewide]')).toBeVisible();
      await expect(page.locator('[data-breakdown-final]')).toBeVisible();
    });

    test('should calculate subscription savings correctly', async ({ page }) => {
      const subscriptionSavings = page.locator('[data-subscription-savings] .savings-amount');
      await expect(subscriptionSavings).toBeVisible();

      const savingsText = await subscriptionSavings.textContent();
      expect(savingsText).toContain('$');
      expect(parseFloat(savingsText?.replace(/[$,]/g, '') || '0')).toBeGreaterThan(0);
    });
  });

  test.describe('Add to Cart', () => {
    test('should add single mode product to cart', async ({ page }) => {
      // Select single mode with chocolate flavor (should be default)
      await expect(page.locator('#mode-single')).toBeChecked();
      await expect(page.locator('#single-flavor-chocolate')).toBeChecked();

      // Click add to cart
      await page.click('#add-to-cart');

      // Wait for cart addition to complete
      await page.waitForTimeout(1000);

      // Verify success feedback (this depends on your implementation)
      // Could be a toast notification, modal, or button state change
      const addToCartButton = page.locator('#add-to-cart');
      
      // Check for success state or loading state resolution
      await expect(addToCartButton).not.toHaveClass(/loading/);
    });

    test('should add double mode product to cart', async ({ page }) => {
      // Switch to double mode
      await page.click('#mode-double');

      // Select flavor combination
      await page.click('#double-flavor1-chocolate');
      await page.click('#double-flavor2-vanilla');

      // Verify button is enabled
      await expect(page.locator('#add-to-cart')).toBeEnabled();

      // Click add to cart
      await page.click('#add-to-cart');

      // Wait for cart addition
      await page.waitForTimeout(1000);

      // Verify success
      const addToCartButton = page.locator('#add-to-cart');
      await expect(addToCartButton).not.toHaveClass(/loading/);
    });

    test('should disable add to cart for invalid selections', async ({ page }) => {
      // Switch to double mode
      await page.click('#mode-double');

      // Select only one flavor (invalid state)
      await page.click('#double-flavor1-chocolate');

      // Verify add to cart is disabled
      await expect(page.locator('#add-to-cart')).toBeDisabled();
    });
  });

  test.describe('Media Gallery', () => {
    test('should display product images', async ({ page }) => {
      // Check main image
      await expect(page.locator('[data-media-gallery] img')).toBeVisible();

      // Check thumbnail images if they exist
      const thumbnails = page.locator('[data-media-thumbnails] img');
      const thumbnailCount = await thumbnails.count();
      
      if (thumbnailCount > 0) {
        await expect(thumbnails.first()).toBeVisible();
      }
    });

    test('should change main image when clicking thumbnails', async ({ page }) => {
      const thumbnails = page.locator('[data-media-thumbnails] img');
      const thumbnailCount = await thumbnails.count();

      if (thumbnailCount > 1) {
        // Get initial main image src
        const mainImage = page.locator('[data-media-gallery] img');
        const initialSrc = await mainImage.getAttribute('src');

        // Click second thumbnail
        await thumbnails.nth(1).click();

        // Wait for image change
        await page.waitForTimeout(500);

        // Verify main image has changed
        const newSrc = await mainImage.getAttribute('src');
        expect(newSrc).not.toBe(initialSrc);
      }
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should work correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify elements are still visible and functional
      await expect(page.locator('#mode-single')).toBeVisible();
      await expect(page.locator('#mode-double')).toBeVisible();
      await expect(page.locator('#add-to-cart')).toBeVisible();

      // Test mode switching on mobile
      await page.click('#mode-double');
      await expect(page.locator('#mode-double')).toBeChecked();
    });

    test('should work correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Verify functionality
      await page.click('#mode-double');
      await page.click('#double-flavor1-vanilla');
      await page.click('#double-flavor2-orange');

      await expect(page.locator('#add-to-cart')).toBeEnabled();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/cart/add.js', route => route.abort());

      // Try to add to cart
      await page.click('#add-to-cart');

      // Wait for error handling
      await page.waitForTimeout(2000);

      // Verify error state is handled (button should return to normal state)
      const addToCartButton = page.locator('#add-to-cart');
      await expect(addToCartButton).not.toHaveClass(/loading/);
      await expect(addToCartButton).toBeEnabled();
    });

    test('should validate selections before cart addition', async ({ page }) => {
      // Switch to double mode
      await page.click('#mode-double');

      // Don't select any flavors
      // Button should be disabled
      await expect(page.locator('#add-to-cart')).toBeDisabled();

      // Select one flavor
      await page.click('#double-flavor1-chocolate');
      
      // Button should still be disabled
      await expect(page.locator('#add-to-cart')).toBeDisabled();

      // Select second flavor
      await page.click('#double-flavor2-vanilla');

      // Now button should be enabled
      await expect(page.locator('#add-to-cart')).toBeEnabled();
    });
  });

  test.describe('Accessibility', () => {
    test('should be navigable with keyboard', async ({ page }) => {
      // Start from the top of the page
      await page.keyboard.press('Tab');

      // Navigate to mode selection
      let focusedElement = await page.evaluate(() => document.activeElement?.id);
      
      // Tab through radio buttons
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Navigate to flavor selection
      await page.keyboard.press('Tab');

      // Use arrow keys to select flavors
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Navigate to add to cart button
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.id);
      expect(focusedElement).toBe('add-to-cart');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check radio buttons have proper labels
      const singleModeRadio = page.locator('#mode-single');
      await expect(singleModeRadio).toHaveAttribute('aria-label');

      const doubleModeRadio = page.locator('#mode-double');
      await expect(doubleModeRadio).toHaveAttribute('aria-label');

      // Check flavor options have labels
      const chocolateOption = page.locator('#single-flavor-chocolate');
      await expect(chocolateOption).toHaveAttribute('aria-label');
    });

    test('should announce state changes to screen readers', async ({ page }) => {
      // Check for aria-live regions
      const statusRegion = page.locator('[aria-live]');
      await expect(statusRegion).toBeVisible();

      // Test that price changes update the live region
      await page.click('#single-flavor-vanilla');
      
      // Wait for live region update
      await page.waitForTimeout(500);
      
      const statusText = await statusRegion.textContent();
      expect(statusText).toBeTruthy();
    });
  });
});