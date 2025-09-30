import type {
  CartAddResult,
  CartLineItemInput,
  CartValidationResult
} from '../types/shopify';

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface NormalizedCartItem {
  id: number;
  quantity: number;
  properties: Record<string, string | number>;
}

interface CartEndpoints {
  add: string;
  cart: string;
}

export class CartAPI<TCart = unknown> {
  private readonly fetchImpl: FetchLike | null;
  private readonly endpoints: CartEndpoints;

  constructor(fetchImpl?: FetchLike | null) {
    this.fetchImpl = fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    this.endpoints = {
      add: '/cart/add.js',
      cart: '/cart.js'
    };
  }

  async addToCart(items: CartLineItemInput | CartLineItemInput[]): Promise<CartAddResult<TCart>> {
    const normalizedItems = Array.isArray(items) ? items : [items];
    const validation = this.validateCartItems(normalizedItems);

    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', '), cart: null };
    }

    if (!this.fetchImpl) {
      return { success: false, error: 'Fetch API is not available', cart: null };
    }

    const payload = {
      items: normalizedItems.map((item) => this.normalizeItem(item))
    };

    try {
      const response = await this.fetchImpl(this.endpoints.add, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string };
        const message = errorData?.message || `HTTP ${response.status}`;
        return { success: false, error: message, cart: null };
      }

      await response.json().catch(() => ({}));
      const cart = await this.getCart();
      return { success: true, cart };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add to cart';
      return { success: false, error: message, cart: null };
    }
  }

  async getCart(): Promise<TCart | null> {
    if (!this.fetchImpl) {
      return null;
    }

    try {
      const response = await this.fetchImpl(this.endpoints.cart, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as TCart;
    } catch {
      return null;
    }
  }

  validateCartItems(items: CartLineItemInput[]): CartValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(items) || items.length === 0) {
      errors.push('No items provided');
      return { isValid: false, errors };
    }

    items.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Item ${index + 1}: Invalid item data`);
        return;
      }

      if (!this.isValidVariantId(item.id)) {
        errors.push(`Item ${index + 1}: Variant ID is required`);
      }

      if (!this.isValidQuantity(item.quantity)) {
        errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private normalizeItem(item: CartLineItemInput): NormalizedCartItem {
    return {
      id: Number(item.id),
      quantity: this.normalizeQuantity(item.quantity),
      properties: item.properties ? { ...item.properties } : {}
    };
  }

  private normalizeQuantity(quantity: CartLineItemInput['quantity']): number {
    const value = Number.isInteger(quantity) ? Number(quantity) : 1;
    return value > 0 ? value : 1;
  }

  private isValidQuantity(quantity: CartLineItemInput['quantity']): boolean {
    if (quantity === undefined) {
      return true;
    }
    return Number.isInteger(quantity) && Number(quantity) > 0;
  }

  private isValidVariantId(id: CartLineItemInput['id']): boolean {
    const numericId = Number.parseInt(String(id), 10);
    return !Number.isNaN(numericId) && numericId > 0;
  }
}
