// Shared TypeScript types describing the API responses the frontend consumes.

// A platform user shown in the switcher.
export interface User {
  id: string;
  displayName: string;
  email: string;
}

// A user's Gold Coin wallet.
export interface Wallet {
  id: string;
  userId: string;
  balanceCoins: number;
  version: number;
}

// A single ledger entry.
export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amountCoins: number;
  balanceAfter: number;
  referenceType: 'PAYMENT' | 'ORDER';
  referenceId: string;
  createdAt: string;
}

// A purchasable coin package.
export interface CoinPackage {
  id: string;
  name: string;
  priceCents: number;
  coins: number;
}

// A product category.
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

// A catalog product priced in coins.
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  priceCoins: number;
  imageUrl: string;
  category?: ProductCategory;
}

// A line item inside the cart.
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

// The cart with derived totals.
export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  totalCoins: number;
}

// A payment intent plus the mock-gateway redirect URL.
export interface Payment {
  id: string;
  coins: number;
  amountCents: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  redirectUrl?: string;
}

// A line item inside an order (price snapshotted at purchase time).
export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCoins: number;
  product: Product;
}

// A placed order.
export interface Order {
  id: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  totalCoins: number;
  createdAt: string;
  items: OrderItem[];
}
