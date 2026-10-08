// Domain enums mirrored as string constants, kept in sync with the Prisma schema's string columns.

// Lifecycle states of a coin-purchase payment.
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// Lifecycle states of a product order.
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

// Direction of a wallet ledger entry.
export enum WalletTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

// What a wallet ledger entry refers to.
export enum WalletReferenceType {
  PAYMENT = 'PAYMENT',
  ORDER = 'ORDER',
}

// Catalog category slugs.
export enum ProductCategorySlug {
  SKIN = 'skin',
  EMOTE = 'emote',
  BATTLE_PASS = 'battle-pass',
}
