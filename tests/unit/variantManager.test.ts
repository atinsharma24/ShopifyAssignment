import { beforeEach, describe, expect, test } from '@jest/globals';
import { VariantManager } from '../../src/ui/variant-manager';
import type {
  ShopifyProduct,
  ShopifyProductVariant,
  SelectionInput,
  SingleSelection,
  DoubleSelection
} from '../../src/types/shopify';

describe('VariantManager', () => {
  let variantManager: VariantManager;
  let mockProductData: ShopifyProduct;

  beforeEach(() => {
    mockProductData = {
      id: 123456789,
      title: 'Premium Drink Subscription',
      variants: [
        {
          id: 111,
          title: 'Single Chocolate Subscription',
          price: 2500,
          available: true,
          options: ['Single', 'Chocolate', 'Subscription'],
          inventory_quantity: 10
        },
        {
          id: 112,
          title: 'Single Vanilla Subscription',
          price: 2500,
          available: true,
          options: ['Single', 'Vanilla', 'Subscription'],
          inventory_quantity: 5
        },
        {
          id: 113,
          title: 'Single Orange Subscription',
          price: 2500,
          available: true,
          options: ['Single', 'Orange', 'Subscription'],
          inventory_quantity: 8
        },
        {
          id: 211,
          title: 'Double Chocolate Vanilla Subscription',
          price: 4500,
          available: true,
          options: ['Double', 'Chocolate', 'Vanilla', 'Subscription'],
          inventory_quantity: 3
        },
        {
          id: 212,
          title: 'Double Chocolate Orange Subscription',
          price: 4500,
          available: true,
          options: ['Double', 'Chocolate', 'Orange', 'Subscription'],
          inventory_quantity: 2
        },
        {
          id: 213,
          title: 'Double Vanilla Orange Subscription',
          price: 4500,
          available: false,
          options: ['Double', 'Vanilla', 'Orange', 'Subscription'],
          inventory_quantity: 0
        }
      ]
    };

    variantManager = new VariantManager(mockProductData);
  });

  describe('constructor', () => {
    test('initializes with product data', () => {
      expect(variantManager.product).toEqual(mockProductData);
      expect(variantManager.variants).toHaveLength(6);
    });

    test('handles missing variants gracefully', () => {
      const emptyProductData: ShopifyProduct = { variants: [] };
      const emptyManager = new VariantManager(emptyProductData);

      expect(emptyManager.variants).toHaveLength(0);
    });
  });

  describe('findVariant', () => {
    test('finds correct variant for single mode selections', () => {
      const selections = {
        mode: 'single' as const,
        flavor: 'Chocolate'
      };

      const variant = variantManager.findVariant(selections);

      expect(variant).toBeTruthy();
      expect(variant?.id).toBe(111);
      expect(variant?.title).toContain('Single');
      expect(variant?.title).toContain('Chocolate');
    });

    test('finds correct variant for all single flavors', () => {
      const flavors = ['Chocolate', 'Vanilla', 'Orange'] as const;
      const expectedIds = [111, 112, 113];

      flavors.forEach((flavor, index) => {
        const selections = { mode: 'single' as const, flavor };
        const variant = variantManager.findVariant(selections);

        expect(variant).toBeTruthy();
        expect(variant?.id).toBe(expectedIds[index]);
      });
    });

    test('finds correct variant for double mode selections', () => {
      const selections = {
        mode: 'double' as const,
        flavor1: 'Chocolate',
        flavor2: 'Vanilla'
      };

      const variant = variantManager.findVariant(selections);

      expect(variant).toBeTruthy();
      expect(variant?.id).toBe(211);
      expect(variant?.title).toContain('Double');
      expect(variant?.title).toContain('Chocolate');
      expect(variant?.title).toContain('Vanilla');
    });

    test('handles flavor order independence for double mode', () => {
      const selections1 = {
        mode: 'double' as const,
        flavor1: 'Chocolate',
        flavor2: 'Orange'
      };

      const selections2 = {
        mode: 'double' as const,
        flavor1: 'Orange',
        flavor2: 'Chocolate'
      };

      const variant1 = variantManager.findVariant(selections1);
      const variant2 = variantManager.findVariant(selections2);

      expect(variant1).toBeTruthy();
      expect(variant2).toBeTruthy();
      expect(variant1?.id).toBe(variant2?.id);
      expect(variant1?.id).toBe(212);
    });

    test('returns null for invalid selections', () => {
      const invalidSelections = [
        null,
        undefined,
        {} as unknown,
        { mode: 'invalid' },
        { mode: 'single' },
        { mode: 'double', flavor1: 'Chocolate' },
        { mode: 'single', flavor: 'InvalidFlavor' }
      ];

      invalidSelections.forEach((selections) => {
        const variant = variantManager.findVariant(selections as SelectionInput);
        expect(variant).toBeNull();
      });
    });

    test('returns null for non-existent variant combinations', () => {
      const selections = {
        mode: 'double' as const,
        flavor1: 'Strawberry',
        flavor2: 'Banana'
      };

      const variant = variantManager.findVariant(selections);
      expect(variant).toBeNull();
    });
  });

  describe('matchesVariant', () => {
    test('matches single mode variants correctly', () => {
      const variant = mockProductData.variants[0] as ShopifyProductVariant;
      const criteria = {
        mode: 'Single',
        flavor: 'Chocolate',
        type: 'subscription'
      } as const;

      const matches = variantManager.matchesVariant(variant, criteria);
      expect(matches).toBe(true);
    });

    test('matches double mode variants correctly', () => {
      const variant = mockProductData.variants[3] as ShopifyProductVariant;
      const criteria = {
        mode: 'Double',
        flavor1: 'Chocolate',
        flavor2: 'Vanilla',
        type: 'subscription'
      } as const;

      const matches = variantManager.matchesVariant(variant, criteria);
      expect(matches).toBe(true);
    });

    test('rejects non-matching variants', () => {
      const variant = mockProductData.variants[0] as ShopifyProductVariant;
      const criteria = {
        mode: 'Double',
        flavor1: 'Vanilla',
        flavor2: 'Orange',
        type: 'subscription'
      } as const;

      const matches = variantManager.matchesVariant(variant, criteria);
      expect(matches).toBe(false);
    });
  });

  describe('isVariantAvailable', () => {
    test('returns true for available variants', () => {
      const availableVariant = mockProductData.variants[0] as ShopifyProductVariant;
      expect(variantManager.isVariantAvailable(availableVariant)).toBe(true);
    });

    test('returns false for unavailable variants', () => {
      const unavailableVariant = mockProductData.variants[5] as ShopifyProductVariant;
      expect(variantManager.isVariantAvailable(unavailableVariant)).toBe(false);
    });

    test('handles null/undefined variants', () => {
      expect(variantManager.isVariantAvailable(null)).toBe(false);
      expect(variantManager.isVariantAvailable(undefined)).toBe(false);
    });
  });

  describe('getVariantById', () => {
    test('finds variant by ID', () => {
      const variant = variantManager.getVariantById(111);
      expect(variant).toBeTruthy();
      expect(variant?.id).toBe(111);
      expect(variant?.title).toContain('Single Chocolate');
    });

    test('returns null for non-existent ID', () => {
      const variant = variantManager.getVariantById(999);
      expect(variant).toBeNull();
    });

    test('handles string and number IDs', () => {
      const variant1 = variantManager.getVariantById(111);
      const variant2 = variantManager.getVariantById('111');

      expect(variant1).toBeTruthy();
      expect(variant2).toBeTruthy();
      expect(variant1?.id).toBe(variant2?.id);
    });
  });

  describe('getDefaultVariant', () => {
    test('returns first available variant', () => {
      const defaultVariant = variantManager.getDefaultVariant();
      expect(defaultVariant).toBeTruthy();
      expect(defaultVariant?.available).toBe(true);
      expect(defaultVariant?.id).toBe(111);
    });

    test('returns first variant when none available', () => {
      const allUnavailableData: ShopifyProduct = {
        ...mockProductData,
        variants: mockProductData.variants.map((variant: ShopifyProductVariant) => ({
          ...variant,
          available: false
        }))
      };

      const unavailableManager = new VariantManager(allUnavailableData);
      const defaultVariant = unavailableManager.getDefaultVariant();

      expect(defaultVariant).toBeTruthy();
      expect(defaultVariant?.id).toBe(111);
    });
  });

  describe('validateSelections', () => {
    test('validates correct single mode selections', () => {
      const selections = {
        mode: 'single' as const,
        flavor: 'Chocolate'
      };

      const validation = variantManager.validateSelections(selections);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.variant).toBeTruthy();
      expect(validation.variant?.id).toBe(111);
    });

    test('validates correct double mode selections', () => {
      const selections = {
        mode: 'double' as const,
        flavor1: 'Chocolate',
        flavor2: 'Orange'
      };

      const validation = variantManager.validateSelections(selections);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.variant).toBeTruthy();
    });

    test('invalidates incomplete selections', () => {
      const incompleteSelections: Array<Record<string, string>> = [
        { mode: 'single' },
        { mode: 'double', flavor1: 'Chocolate' },
        { flavor: 'Chocolate' },
        { mode: 'double', flavor2: 'Vanilla' }
      ];

      incompleteSelections.forEach((selections) => {
        const validation = variantManager.validateSelections(selections);
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      });
    });

    test('invalidates selections with no matching variant', () => {
      const selections = {
        mode: 'single' as const,
        flavor: 'NonExistentFlavor'
      };

      const validation = variantManager.validateSelections(selections);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('No product variant available for selected options');
    });

    test('invalidates selections with out-of-stock variant', () => {
      const selections = {
        mode: 'double' as const,
        flavor1: 'Vanilla',
        flavor2: 'Orange'
      };

      const validation = variantManager.validateSelections(selections);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Selected variant is currently out of stock');
    });
  });

  describe('generateAllCombinations', () => {
    test('generates all possible selection combinations', () => {
      const combinations = variantManager.generateAllCombinations();

      expect(combinations).toHaveLength(12);

      const singleCombinations = combinations.filter(
        (combo: SingleSelection | DoubleSelection): combo is SingleSelection =>
          combo.mode === 'single'
      );
      expect(singleCombinations).toHaveLength(3);

      const doubleCombinations = combinations.filter(
        (combo: SingleSelection | DoubleSelection): combo is DoubleSelection =>
          combo.mode === 'double'
      );
      expect(doubleCombinations).toHaveLength(9);
    });

    test('includes all expected combinations', () => {
      const combinations = variantManager.generateAllCombinations();

      const singleChocolate = combinations.find(
        (combo: SingleSelection | DoubleSelection): combo is SingleSelection =>
          combo.mode === 'single' && combo.flavor === 'Chocolate'
      );
      expect(singleChocolate).toBeTruthy();

      const doubleChocolateVanilla = combinations.find(
        (combo: SingleSelection | DoubleSelection): combo is DoubleSelection =>
          combo.mode === 'double' && combo.flavor1 === 'Chocolate' && combo.flavor2 === 'Vanilla'
      );
      expect(doubleChocolateVanilla).toBeTruthy();
    });
  });

  describe('getAvailableFlavors', () => {
    test('extracts available flavors for single mode', () => {
      const flavors = variantManager.getAvailableFlavors('single');

      expect(flavors).toContain('Chocolate');
      expect(flavors).toContain('Vanilla');
      expect(flavors).toContain('Orange');
      expect(flavors).toHaveLength(3);
    });

    test('extracts available flavors for double mode', () => {
      const flavors = variantManager.getAvailableFlavors('double');

      expect(flavors).toContain('Chocolate');
      expect(flavors).toContain('Vanilla');
      expect(flavors).toContain('Orange');
    });
  });

  describe('edge cases and error handling', () => {
    test('handles empty product data', () => {
      const emptyManager = new VariantManager({ variants: [] } as unknown as ShopifyProduct);

      expect(emptyManager.findVariant({ mode: 'single', flavor: 'Chocolate' })).toBeNull();
      expect(emptyManager.getDefaultVariant()).toBeNull();
      expect(emptyManager.getAvailableFlavors()).toHaveLength(0);
    });

    test('handles malformed variant data', () => {
      const malformedData: ShopifyProduct = {
        variants: [{ id: 1 }, { id: 2, title: null, options: null }, { id: 3, title: '', options: [] }]
      };

      const malformedManager = new VariantManager(malformedData);
      const result = malformedManager.findVariant({ mode: 'single', flavor: 'Chocolate' });

      expect(result).toBeNull();
    });
  });
});
