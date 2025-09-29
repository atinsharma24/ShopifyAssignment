/**
 * Unit tests for VariantManager module
 * Tests variant mapping, selection validation, and cart item generation
 */

const VariantManager = require('../../src/js/ui/variant-manager.js');

describe('VariantManager', () => {
  let variantManager;
  let mockProduct;

  beforeEach(() => {
    mockProduct = createMockProduct();
    variantManager = new VariantManager(mockProduct);
  });

  describe('constructor', () => {
    test('initializes with product data', () => {
      expect(variantManager.product).toBe(mockProduct);
      expect(variantManager.variants).toEqual(mockProduct.variants);
    });

    test('handles product without variants', () => {
      const productWithoutVariants = { id: 123 };
      const manager = new VariantManager(productWithoutVariants);
      expect(manager.variants).toEqual([]);
    });
  });

  describe('findMatchingVariant', () => {
    test('finds variant for single mode with chocolate flavor', () => {
      const selections = {
        mode: 'single',
        flavors: ['Chocolate']
      };

      const variant = variantManager.findMatchingVariant(selections);
      expect(variant).not.toBeNull();
      expect(variant.id).toBe(987654321);
      expect(variant.title).toBe('Chocolate');
    });

    test('finds variant for single mode with vanilla flavor', () => {
      const selections = {
        mode: 'single',
        flavors: ['Vanilla']
      };

      const variant = variantManager.findMatchingVariant(selections);
      expect(variant).not.toBeNull();
      expect(variant.id).toBe(987654322);
      expect(variant.title).toBe('Vanilla');
    });

    test('finds variant for double mode with multiple flavors', () => {
      const selections = {
        mode: 'double',
        flavors: ['Chocolate', 'Vanilla']
      };

      const variant = variantManager.findMatchingVariant(selections);
      expect(variant).not.toBeNull();
      // Should return first flavor's variant as fallback
      expect(variant.id).toBe(987654321);
    });

    test('returns null for invalid selections', () => {
      expect(variantManager.findMatchingVariant({})).toBeNull();
      expect(variantManager.findMatchingVariant({ mode: 'single' })).toBeNull();
      expect(variantManager.findMatchingVariant({ flavors: [] })).toBeNull();
      expect(variantManager.findMatchingVariant({ mode: 'single', flavors: [] })).toBeNull();
    });

    test('returns null for non-existent flavor', () => {
      const selections = {
        mode: 'single',
        flavors: ['Strawberry']
      };

      const variant = variantManager.findMatchingVariant(selections);
      expect(variant).toBeNull();
    });
  });

  describe('findVariantByTitle', () => {
    test('finds variant by exact title match', () => {
      const variant = variantManager.findVariantByTitle('Chocolate');
      expect(variant).not.toBeNull();
      expect(variant.title).toBe('Chocolate');
    });

    test('finds variant by case-insensitive title match', () => {
      const variant = variantManager.findVariantByTitle('chocolate');
      expect(variant).not.toBeNull();
      expect(variant.title).toBe('Chocolate');
    });

    test('finds variant by option match', () => {
      const variant = variantManager.findVariantByTitle('Vanilla');
      expect(variant).not.toBeNull();
      expect(variant.options).toContain('Vanilla');
    });

    test('returns null for non-matching title', () => {
      const variant = variantManager.findVariantByTitle('NonExistent');
      expect(variant).toBeNull();
    });
  });

  describe('findCombinationVariant', () => {
    test('returns null for single flavor', () => {
      const variant = variantManager.findCombinationVariant(['Chocolate']);
      expect(variant).toBeNull();
    });

    test('attempts to find combination variant for multiple flavors', () => {
      // With our current mock data, this should return null since we don't have combination variants
      const variant = variantManager.findCombinationVariant(['Chocolate', 'Vanilla']);
      expect(variant).toBeNull();
    });

    test('finds combination variant when one exists', () => {
      // Add a combination variant to mock data
      mockProduct.variants.push({
        id: 987654324,
        title: 'Chocolate + Vanilla Combo',
        options: ['Chocolate', 'Vanilla'],
        price: 4500,
        available: true
      });

      const manager = new VariantManager(mockProduct);
      const variant = manager.findCombinationVariant(['Chocolate', 'Vanilla']);
      expect(variant).not.toBeNull();
      expect(variant.id).toBe(987654324);
    });
  });

  describe('getCartItems', () => {
    test('generates cart item for single mode', () => {
      const selections = {
        mode: 'single',
        flavors: ['Chocolate']
      };

      const items = variantManager.getCartItems(selections);
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({
        id: 987654321,
        quantity: 1,
        properties: {
          'Purchase Mode': 'Single Subscription',
          'Flavor': 'Chocolate'
        }
      });
    });

    test('generates cart items for double mode with separate variants', () => {
      const selections = {
        mode: 'double',
        flavors: ['Chocolate', 'Vanilla']
      };

      const items = variantManager.getCartItems(selections);
      expect(items).toHaveLength(2);
      
      expect(items[0]).toEqual({
        id: 987654321,
        quantity: 1,
        properties: {
          'Purchase Mode': 'Double Subscription',
          'Flavor': 'Chocolate',
          'Position': 'Flavor 1'
        }
      });

      expect(items[1]).toEqual({
        id: 987654322,
        quantity: 1,
        properties: {
          'Purchase Mode': 'Double Subscription',
          'Flavor': 'Vanilla',
          'Position': 'Flavor 2'
        }
      });
    });

    test('generates single cart item for double mode with combination variant', () => {
      // Add combination variant
      mockProduct.variants.push({
        id: 987654324,
        title: 'Chocolate + Vanilla Combo',
        options: ['Chocolate', 'Vanilla'],
        price: 4500,
        available: true
      });

      const manager = new VariantManager(mockProduct);
      const selections = {
        mode: 'double',
        flavors: ['Chocolate', 'Vanilla']
      };

      const items = manager.getCartItems(selections);
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({
        id: 987654324,
        quantity: 1,
        properties: {
          'Purchase Mode': 'Double Subscription',
          'Flavors': 'Chocolate, Vanilla'
        }
      });
    });

    test('returns empty array for invalid selections', () => {
      expect(variantManager.getCartItems({})).toEqual([]);
      expect(variantManager.getCartItems({ mode: 'single' })).toEqual([]);
      expect(variantManager.getCartItems({ flavors: [] })).toEqual([]);
    });

    test('handles missing variants gracefully', () => {
      const selections = {
        mode: 'single',
        flavors: ['NonExistent']
      };

      const items = variantManager.getCartItems(selections);
      expect(items).toEqual([]);
    });
  });

  describe('validateSelections', () => {
    test('validates correct single mode selection', () => {
      const selections = {
        mode: 'single',
        flavors: ['Chocolate']
      };

      const result = variantManager.validateSelections(selections);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('validates correct double mode selection', () => {
      const selections = {
        mode: 'double',
        flavors: ['Chocolate', 'Vanilla']
      };

      const result = variantManager.validateSelections(selections);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('reports error for missing mode', () => {
      const selections = {
        flavors: ['Chocolate']
      };

      const result = variantManager.validateSelections(selections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Please select a purchase mode');
    });

    test('reports error for missing flavors', () => {
      const selections = {
        mode: 'single',
        flavors: []
      };

      const result = variantManager.validateSelections(selections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Please select at least one flavor');
    });

    test('reports error for single mode with multiple flavors', () => {
      const selections = {
        mode: 'single',
        flavors: ['Chocolate', 'Vanilla']
      };

      const result = variantManager.validateSelections(selections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Single mode requires exactly one flavor selection');
    });

    test('reports error for double mode with insufficient flavors', () => {
      const selections = {
        mode: 'double',
        flavors: ['Chocolate']
      };

      const result = variantManager.validateSelections(selections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Double mode requires two flavor selections');
    });

    test('reports error for non-existent variant', () => {
      const selections = {
        mode: 'single',
        flavors: ['NonExistent']
      };

      const result = variantManager.validateSelections(selections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No product variant available for selected combination');
    });

    test('reports error for unavailable variant', () => {
      // Make chocolate variant unavailable
      mockProduct.variants[0].available = false;
      const manager = new VariantManager(mockProduct);

      const selections = {
        mode: 'single',
        flavors: ['Chocolate']
      };

      const result = manager.validateSelections(selections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Selected variant is currently sold out');
    });
  });

  describe('getAvailableFlavors', () => {
    test('returns available flavors from variants', () => {
      const flavors = variantManager.getAvailableFlavors();
      expect(flavors).toContain('Chocolate');
      expect(flavors).toContain('Vanilla');
      expect(flavors).toContain('Orange');
      expect(flavors).toHaveLength(3);
    });

    test('returns empty array when no variants exist', () => {
      const productWithoutVariants = { variants: [] };
      const manager = new VariantManager(productWithoutVariants);
      const flavors = manager.getAvailableFlavors();
      expect(flavors).toEqual([]);
    });

    test('handles variants without recognizable flavors', () => {
      const productWithCustomVariants = {
        variants: [
          {
            title: 'Custom Product',
            options: ['Custom'],
            available: true
          }
        ]
      };
      const manager = new VariantManager(productWithCustomVariants);
      const flavors = manager.getAvailableFlavors();
      expect(flavors).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty product data', () => {
      const emptyProduct = {};
      const manager = new VariantManager(emptyProduct);
      expect(manager.variants).toEqual([]);
      expect(manager.getAvailableFlavors()).toEqual([]);
    });

    test('handles null/undefined product data', () => {
      expect(() => new VariantManager(null)).not.toThrow();
      expect(() => new VariantManager(undefined)).not.toThrow();
    });

    test('handles variants with missing properties', () => {
      const productWithIncompleteVariants = {
        variants: [
          { id: 1 }, // Missing title, options, etc.
          { title: 'Incomplete' }, // Missing id, options, etc.
          { id: 2, title: 'Complete', options: ['Test'], available: true }
        ]
      };

      const manager = new VariantManager(productWithIncompleteVariants);
      expect(() => manager.findVariantByTitle('Test')).not.toThrow();
      expect(() => manager.validateSelections({ mode: 'single', flavors: ['Test'] })).not.toThrow();
    });
  });

  describe('Real-world scenarios', () => {
    test('handles typical user workflow: single chocolate selection', () => {
      const selections = { mode: 'single', flavors: ['Chocolate'] };
      
      // Validate selections
      const validation = variantManager.validateSelections(selections);
      expect(validation.valid).toBe(true);
      
      // Find variant
      const variant = variantManager.findMatchingVariant(selections);
      expect(variant).not.toBeNull();
      expect(variant.available).toBe(true);
      
      // Generate cart items
      const cartItems = variantManager.getCartItems(selections);
      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].id).toBe(variant.id);
    });

    test('handles double flavor selection workflow', () => {
      const selections = { mode: 'double', flavors: ['Chocolate', 'Vanilla'] };
      
      // Validate selections
      const validation = variantManager.validateSelections(selections);
      expect(validation.valid).toBe(true);
      
      // Find variant (should find chocolate as primary)
      const variant = variantManager.findMatchingVariant(selections);
      expect(variant).not.toBeNull();
      
      // Generate cart items (should create two separate items)
      const cartItems = variantManager.getCartItems(selections);
      expect(cartItems).toHaveLength(2);
    });
  });
});