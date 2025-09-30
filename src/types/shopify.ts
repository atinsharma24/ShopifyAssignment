export type SingleSelection = {
  mode: 'single';
  flavor: string;
};

export type DoubleSelection = {
  mode: 'double';
  flavor1: string;
  flavor2: string;
};

export type SelectionInput = SingleSelection | DoubleSelection;

export interface ShopifyMediaReference {
  id?: number | string | null;
  src?: string | null;
}

export interface ShopifyProductVariant {
  id: number | string;
  title?: string | null;
  price?: number;
  available?: boolean;
  inventory_quantity?: number | null;
  options?: Array<string | null> | null;
  featured_media?: ShopifyMediaReference | null;
  featured_media_id?: number | string | null;
  image_id?: number | string | null;
  featured_image?: ShopifyMediaReference | null;
  [key: string]: unknown;
}

export interface ShopifyProduct {
  id?: number | string;
  title?: string | null;
  variants: ShopifyProductVariant[];
  [key: string]: unknown;
}

export interface CartLineItemInput {
  id: number | string;
  quantity?: number;
  properties?: Record<string, string | number>;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CartAddResult<TCart = unknown> {
  success: boolean;
  cart: TCart | null;
  error?: string;
}
