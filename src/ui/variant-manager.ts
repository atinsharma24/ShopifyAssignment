import type {
  DoubleSelection,
  SelectionInput,
  ShopifyProduct,
  ShopifyProductVariant,
  SingleSelection
} from '../types/shopify';

type SelectionRecord = Partial<Record<'mode' | 'flavor' | 'flavor1' | 'flavor2', unknown>> & {
  [key: string]: unknown;
};

type VariantSearchCriteria = {
  mode?: 'Single' | 'Double';
  flavor?: string;
  flavor1?: string;
  flavor2?: string;
  type?: string;
};

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  variant: ShopifyProductVariant | null;
};

const KNOWN_FLAVORS = ['chocolate', 'vanilla', 'orange'];

export class VariantManager {
  public readonly product: ShopifyProduct;
  public readonly variants: ShopifyProductVariant[];

  constructor(productData: ShopifyProduct) {
    this.product = productData;
    this.variants = Array.isArray(productData.variants) ? [...productData.variants] : [];

    console.log('VariantManager initialized with', this.variants.length, 'variants');
  }

  findVariant(
    selections: SelectionInput | SelectionRecord | null | undefined
  ): ShopifyProductVariant | null {
    if (!selections) {
      return null;
    }

    const searchCriteria = this.createSearchCriteria(selections);

    const variant = this.variants.find((candidate) => this.matchesVariant(candidate, searchCriteria));

    if (!variant) {
      console.warn('No variant found for selections:', selections);
      return null;
    }

    console.log('Found variant:', variant.id, 'for selections:', selections);
    return variant;
  }

  private createSearchCriteria(selections: SelectionRecord): VariantSearchCriteria {
    const mode = typeof selections.mode === 'string' ? selections.mode.toLowerCase() : undefined;

    if (mode === 'single') {
      return {
        mode: 'Single',
        flavor: typeof selections.flavor === 'string' ? selections.flavor : undefined,
        type: 'subscription'
      };
    }

    if (mode === 'double') {
      return {
        mode: 'Double',
        flavor1: typeof selections.flavor1 === 'string' ? selections.flavor1 : undefined,
        flavor2: typeof selections.flavor2 === 'string' ? selections.flavor2 : undefined,
        type: 'subscription'
      };
    }

    return {};
  }

  matchesVariant(
    variant: ShopifyProductVariant | null | undefined,
    criteria: VariantSearchCriteria | null | undefined
  ): boolean {
    if (!variant || !criteria) {
      return false;
    }

    const title = (variant.title ?? '').toString().toLowerCase();
    const options = Array.isArray(variant.options)
      ? (variant.options.filter((opt): opt is string => typeof opt === 'string').map((opt) =>
        opt.toLowerCase()
      ))
      : [];

    if (criteria.mode === 'Single') {
      if (!criteria.flavor) {
        return false;
      }

      const flavor = criteria.flavor.toLowerCase();
      const hasMode = title.includes('single') || options.some((opt) => opt.includes('single'));
      const hasFlavor = title.includes(flavor) || options.some((opt) => opt.includes(flavor));

      return hasMode && hasFlavor;
    }

    if (criteria.mode === 'Double') {
      if (!criteria.flavor1 || !criteria.flavor2) {
        return false;
      }

      const flavor1 = criteria.flavor1.toLowerCase();
      const flavor2 = criteria.flavor2.toLowerCase();
      const hasMode = title.includes('double') || options.some((opt) => opt.includes('double'));
      const hasFlavor1 = title.includes(flavor1) || options.some((opt) => opt.includes(flavor1));
      const hasFlavor2 = title.includes(flavor2) || options.some((opt) => opt.includes(flavor2));

      return hasMode && hasFlavor1 && hasFlavor2;
    }

    return false;
  }

  getAvailableFlavors(mode: 'single' | 'double' = 'single'): string[] {
    const flavors = new Set<string>();

    this.variants.forEach((variant) => {
      if (this.variantHasMode(variant, mode)) {
        const extractedFlavors = this.extractFlavorsFromVariant(variant);
        extractedFlavors.forEach((flavor) => flavors.add(flavor));
      }
    });

    return Array.from(flavors);
  }

  private variantHasMode(variant: ShopifyProductVariant, mode: string): boolean {
    const title = (variant.title ?? '').toString().toLowerCase();
    const options = Array.isArray(variant.options)
      ? variant.options
        .filter((opt): opt is string => typeof opt === 'string')
        .map((opt) => opt.toLowerCase())
      : [];

    const modeString = mode.toLowerCase();
    return title.includes(modeString) || options.some((opt) => opt.includes(modeString));
  }

  private extractFlavorsFromVariant(variant: ShopifyProductVariant): string[] {
    const title = (variant.title ?? '').toString().toLowerCase();
    const options = Array.isArray(variant.options)
      ? variant.options
        .filter((opt): opt is string => typeof opt === 'string')
        .map((opt) => opt.toLowerCase())
      : [];

    const searchText = [title, ...options].join(' ');

    return KNOWN_FLAVORS.filter((flavor) => searchText.includes(flavor)).map(
      (flavor) => flavor.charAt(0).toUpperCase() + flavor.slice(1)
    );
  }

  isVariantAvailable(variant: ShopifyProductVariant | null | undefined): boolean {
    if (!variant) {
      return false;
    }

    const availableFlag = variant.available !== false;
    const inStock = variant.inventory_quantity !== 0;
    return availableFlag && inStock;
  }

  getVariantById(variantId: number | string): ShopifyProductVariant | null {
    return (
      this.variants.find((variant) => String(variant.id) === String(variantId)) ?? null
    );
  }

  getDefaultVariant(): ShopifyProductVariant | null {
    const availableVariant = this.variants.find((variant) => this.isVariantAvailable(variant));
    return availableVariant ?? this.variants[0] ?? null;
  }

  generateAllCombinations(): SelectionInput[] {
    const flavors: Array<SingleSelection['flavor']> = ['Chocolate', 'Vanilla', 'Orange'];
    const combinations: SelectionInput[] = [];

    flavors.forEach((flavor) => {
      combinations.push({
        mode: 'single',
        flavor
      });
    });

    flavors.forEach((flavor1) => {
      flavors.forEach((flavor2) => {
        combinations.push({
          mode: 'double',
          flavor1,
          flavor2
        });
      });
    });

    return combinations;
  }

  validateSelections(selections: SelectionInput | SelectionRecord): ValidationResult {
    const errors: string[] = [];
    const mode = typeof selections.mode === 'string' ? selections.mode : '';

    if (!mode) {
      errors.push('Purchase mode is required');
    }

    if (mode === 'single') {
      const singleSelection = selections as SingleSelection;
      if (typeof singleSelection.flavor !== 'string' || singleSelection.flavor.trim() === '') {
        errors.push('Flavor selection is required for single mode');
      }
    }

    if (mode === 'double') {
      const doubleSelection = selections as DoubleSelection;
      if (typeof doubleSelection.flavor1 !== 'string' || doubleSelection.flavor1.trim() === '') {
        errors.push('First flavor selection is required for double mode');
      }
      if (typeof doubleSelection.flavor2 !== 'string' || doubleSelection.flavor2.trim() === '') {
        errors.push('Second flavor selection is required for double mode');
      }
    }

    const variant = this.findVariant(selections);
    if (!variant) {
      errors.push('No product variant available for selected options');
    } else if (!this.isVariantAvailable(variant)) {
      errors.push('Selected variant is currently out of stock');
    }

    return {
      isValid: errors.length === 0,
      errors,
      variant
    };
  }

  selectVariantBySelections(selections: SelectionInput): ShopifyProductVariant | null {
    return this.findVariant(selections);
  }

  getSelectionForVariant(variant: ShopifyProductVariant): SelectionInput | null {
    const title = (variant.title ?? '').toString().toLowerCase();

    if (title.includes('single')) {
      const flavor = KNOWN_FLAVORS.find((flavorName) => title.includes(flavorName));
      if (flavor) {
        return {
          mode: 'single',
          flavor: flavor.charAt(0).toUpperCase() + flavor.slice(1)
        } satisfies SingleSelection;
      }
    }

    if (title.includes('double')) {
      const flavors = KNOWN_FLAVORS.filter((flavorName) => title.includes(flavorName));
      if (flavors.length >= 2) {
        return {
          mode: 'double',
          flavor1: flavors[0].charAt(0).toUpperCase() + flavors[0].slice(1),
          flavor2: flavors[1].charAt(0).toUpperCase() + flavors[1].slice(1)
        } satisfies DoubleSelection;
      }
    }

    return null;
  }
}

export type { DoubleSelection, SelectionInput, ShopifyProduct, ShopifyProductVariant, SingleSelection };
