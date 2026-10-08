# Coin Vault

A virtual **Gold Coin** currency platform for a gaming products store.

Users buy Gold Coins with (mocked) real money, then spend those coins on digital products — skins, emotes, and battle passes. Gold Coins are the **only** currency accepted on the platform.

This README is the single source of truth for every design decision on the project.

---

## Table of contents

1. [What it does](#what-it-does)
2. [Tech stack](#tech-stack)
3. [Repository layout](#repository-layout)
4. [Setup & run](#setup--run)
5. [Architecture](#architecture)
6. [Database schema & 3NF](#database-schema--3nf)
7. [API reference](#api-reference)
8. [Idempotency](#idempotency)
9. [Concurrency](#concurrency)
10. [Payment & order flows](#payment--order-flows)
11. [Testing](#testing)
12. [Decisions & assumptions](#decisions--assumptions)
13. [Trade-offs & what I'd do in real production](#trade-offs--what-id-do-in-real-production)

---

## What it does

- Each user has a **wallet** holding a Gold Coin balance.
- The user buys coins by choosing a package (**$20 / $50 / $100**); coins are credited **1:1** with USD (e.g. $50 → 50 coins).
- Payment is **mocked** but modelled on a real gateway: create an intent → redirect to a hosted-checkout page with a card form → confirm (a simulated webhook) → wallet is credited.
- The user browses a **product catalog**, adds items to a **cart**, and **places an order** paid for in coins.
- Buying coins and placing orders are **idempotent** (safe to retry / double-click) and **safe under concurrency** (a wallet can never be overdrawn).

---

## Tech stack

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| Monorepo  | pnpm workspaces                                    |
| Backend   | NestJS + Prisma ORM, TypeScript                    |
| Database  | SQLite (local file)                                |
| Frontend  | React + Vite + Redux Toolkit (RTK Query) + React Router |
| Styling   | CSS Modules + CSS-variable design tokens           |
| Tests     | Jest (backend unit + concurrency/integration)      |

---

## Repository layout

```
coin-vault/
├─ package.json          # root workspace scripts (dev, build, db:setup)
├─ pnpm-workspace.yaml
├─ README.md
└─ apps/
   ├─ api/               # NestJS + Prisma backend
   │  ├─ prisma/         # schema.prisma + seed.ts + migrations
   │  └─ src/
   │     ├─ common/      # enums, decorators (x-user-id, Idempotency-Key), exception filter
   │     ├─ prisma/      # PrismaService + global module
   │     └─ modules/     # users, wallet, coin-packages, payments, products, cart, orders
   └─ web/               # React frontend
      └─ src/
         ├─ app/         # Redux store + typed hooks
         ├─ api/         # RTK Query base API
         ├─ features/    # one folder per domain: slice/endpoints + custom hook
         ├─ components/  # small reusable UI components (one folder each)
         ├─ pages/       # Store, Cart, Wallet, MockGateway, Orders
         └─ styles/      # tokens.css + global.css
```

Each backend module follows the same shape: **controller** (routes) + **service** (business logic) + **dto** (validation) + **module**. Every function, route, and service method has a one-line comment, on both backend and frontend.

---

## Setup & run

**Prerequisites:** Node 18+ and pnpm.

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Generate the Prisma client, create the SQLite DB, run migrations, and seed demo data
pnpm db:setup

# 3. Run both apps (API on :3000, web on :5173)
pnpm dev
```

Then open **http://localhost:5173**.

Useful scripts:

| Command                | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `pnpm dev`             | Runs the API and web app together                   |
| `pnpm db:setup`        | Generate client + migrate + seed (run once)         |
| `pnpm db:reset`        | Drop, re-migrate, and re-seed the database          |
| `pnpm test`            | Run the backend test suite                          |
| `pnpm build`           | Build both apps                                     |

Environment files (copy `.env.example` → `.env` if you need to change ports):

- `apps/api/.env` — `DATABASE_URL`, `PORT`, `CORS_ORIGIN`
- `apps/web/.env` — `VITE_API_URL`

---

## Architecture

**Why pnpm workspaces (and why no shared package).** Two apps live in one repo so they are installed, built, and run together. We deliberately did **not** add a `packages/shared` package or a shared base tsconfig: the only things both sides share are a few string enums and response shapes, which is not worth the extra workspace/build wiring. Each app keeps its own `types`/enums. If the contract grows, promoting a `shared` package is the obvious next step.

**Backend (NestJS).** Standard modular structure. A global `PrismaModule` exposes one `PrismaService` to every feature. Cross-cutting concerns live in `common/`:
- `CurrentUserId` decorator reads the `x-user-id` header (our stand-in for auth).
- `IdempotencyKey` decorator reads the `Idempotency-Key` header.
- `AllExceptionsFilter` normalises every error into `{ statusCode, message, path, timestamp }`.
- A global `ValidationPipe` validates DTOs and strips unknown fields.

The `WalletService` owns all balance mutations (credit/debit) so the optimistic-locking rule lives in exactly one place; `PaymentsService` and `OrdersService` reuse it inside their transactions.

**Frontend (React + Redux Toolkit).** Server state is handled by **RTK Query** (one `baseApi`, with endpoints injected per feature), which gives caching, auto-refetch, and generated hooks. A tiny `userSlice` holds the active user id (persisted to `localStorage`). Every feature exposes a **custom hook** (`useWallet`, `useCart`, `useCheckout`, `useOrders`, …) so components never touch RTK Query directly. The `baseApi` injects the `x-user-id` header from the store on every request; per-user queries are keyed by user id so switching users refetches. UI is built from **small reusable components** (`Button`, `Card`, `CoinAmount`, `QuantityStepper`, …), each in its own folder with a CSS Module. Colors/spacing/typography are **design tokens** (CSS variables) in `styles/tokens.css`.

---

## Database schema & 3NF

SQLite via Prisma. Enums are stored as string columns (SQLite has no native enum type) and mirrored in `src/common/enums.ts`.

| Table                  | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `users`                | Platform users (seeded; selected via `x-user-id`).             |
| `wallets`              | One per user; `balanceCoins` + `version` (optimistic lock).    |
| `coin_packages`        | Buyable coin bundles ($20/$50/$100); price stored in cents.    |
| `product_categories`   | SKIN / EMOTE / BATTLE_PASS — a separate table (3NF).           |
| `products`             | Catalog items; reference a category; priced in coins.          |
| `payments`             | Coin-purchase intents; unique `idempotencyKey`.                |
| `carts` / `cart_items` | One active cart per user; `(cartId, productId)` is unique.     |
| `orders` / `order_items` | Placed orders; `order_items.unitPriceCoins` is snapshotted.  |
| `wallet_transactions`  | Append-only ledger of every credit/debit, with `balanceAfter`. |

**3NF rationale.**
- Category is extracted into `product_categories` instead of a free-text column on `products`, so category data isn't repeated and has no transitive dependency.
- Money is stored once in its canonical place: coin amounts on packages/products, cents on packages/payments. No derived totals are persisted except where intentional (below).
- **Intentional snapshots (not a normalization violation):** `order_items.unitPriceCoins` and `orders.totalCoins` record the price **at purchase time**. A product's price may change later, but a historical order must not — so the price is copied onto the order. This is a deliberate, standard choice for financial records.

---

## API reference

All routes are prefixed with `/api`. Every request must send an `x-user-id` header identifying the active user. Mutating money endpoints also require an `Idempotency-Key` header.

| Method & path                      | Headers                      | Description                                  |
| ---------------------------------- | ---------------------------- | -------------------------------------------- |
| `GET /users`                       | —                            | List demo users (for the switcher).          |
| `GET /users/:id`                   | —                            | Get one user.                                |
| `GET /wallet`                      | `x-user-id`                  | Current user's wallet + balance.             |
| `GET /wallet/transactions`         | `x-user-id`                  | Ledger history.                              |
| `GET /coin-packages`               | —                            | List coin packages.                          |
| `GET /products?category=slug`      | —                            | List products (optional category filter).    |
| `GET /products/:id`                | —                            | Get one product.                             |
| `GET /product-categories`          | —                            | List categories.                             |
| `GET /cart`                        | `x-user-id`                  | Current cart + totals.                       |
| `POST /cart/items`                 | `x-user-id`                  | Add `{ productId, quantity? }`.              |
| `PATCH /cart/items/:productId`     | `x-user-id`                  | Set `{ quantity }` (0 removes).              |
| `DELETE /cart/items/:productId`    | `x-user-id`                  | Remove a product.                            |
| `DELETE /cart`                     | `x-user-id`                  | Empty the cart.                              |
| `POST /payments/intents`           | `x-user-id`, `Idempotency-Key` | Create an intent `{ coinPackageId }`; returns the payment + `redirectUrl`. |
| `GET /payments/:id`                | `x-user-id`                  | Get a payment's status.                      |
| `POST /payments/:id/confirm`       | `x-user-id`                  | Simulated gateway webhook → credit wallet.   |
| `POST /payments/:id/cancel`        | `x-user-id`                  | Cancel a pending payment.                    |
| `POST /orders`                     | `x-user-id`, `Idempotency-Key` | Place an order from the cart.              |
| `GET /orders`                      | `x-user-id`                  | Order history.                               |
| `GET /orders/:id`                  | `x-user-id`                  | Get one order.                               |

---

## Idempotency

Money-moving POSTs carry a client-generated `Idempotency-Key` (a UUID made with `crypto.randomUUID()` on the frontend).

- **Payment intents** — the key is a unique column on `payments`. Re-posting the same key returns the existing intent instead of creating a new one.
- **Payment confirmation** — confirming an already-`COMPLETED` payment is a no-op, so a retried webhook never credits coins twice. The status flip and the wallet credit happen in one transaction.
- **Orders** — the key is a unique column on `orders`. The service checks for an existing order first; if two identical requests race, the loser hits the unique constraint (`P2002`) and we return the winner's order. Either way the wallet is debited exactly once.

This means a double-clicked "Buy"/"Place order" button, or an automatic network retry, can never double-charge the user.

## Concurrency

The shared resource under contention is the **wallet balance**. We protect it with **optimistic locking**:

- Each `wallet` row has a `version` integer.
- Every balance change reads `{ balanceCoins, version }`, computes the new balance, then writes with `UPDATE ... WHERE id = ? AND version = ?` and `version = version + 1`.
- If another transaction changed the wallet in between, the `WHERE` matches 0 rows → we throw `409 Conflict` instead of writing a stale balance.
- A debit that would drop the balance below 0 is rejected with `422` before any write.

All of this runs inside a Prisma interactive transaction together with the order/credit writes, so the balance, the ledger entry, and the order always agree. This is proven by `apps/api/test/wallet-concurrency.e2e-spec.ts`, which fires 10 concurrent 50-coin debits at a 100-coin wallet and asserts: the balance never goes negative, coins removed exactly match the successful debits, and the ledger holds one entry per successful debit.

## Payment & order flows

**Buy coins (payment):**
1. User picks a package → frontend `POST /payments/intents` with a fresh `Idempotency-Key`.
2. API creates a `PENDING` payment and returns `redirectUrl` (`/checkout/mock/:paymentId`).
3. Frontend redirects to the **mock gateway page**: order summary + a card form prefilled with a test card (`4242 4242 4242 4242`). The card data stays on the page and is **never** sent to the server — it's a UI simulation.
4. User clicks **Pay** → `POST /payments/:id/confirm` (the simulated gateway webhook) → in one transaction the payment flips to `COMPLETED` and the wallet is credited (ledger `CREDIT`).
5. Frontend redirects back to the wallet showing the new balance.

**Buy products (order):**
1. User adds products to the cart, then clicks **Place order** → `POST /orders` with a fresh `Idempotency-Key`.
2. In one transaction: snapshot line prices, debit the wallet under the optimistic lock, create the order + items (status `PAID`), write a ledger `DEBIT`, and clear the cart.
3. Frontend shows the order in history; the balance updates everywhere via cache invalidation.

---

## Testing

```bash
pnpm db:setup   # required once so the SQLite DB and tables exist
pnpm test       # runs the backend Jest suite
```

- `test/wallet-concurrency.e2e-spec.ts` — the concurrency invariant (no overdraft, no lost/phantom updates) under 10 racing debits.
- `test/orders.e2e-spec.ts` — order placement is idempotent for a repeated key (charged once) and rejects orders larger than the balance.

Both suites create their own isolated rows and clean them up, so they don't disturb the seeded demo data.

---

## Decisions & assumptions

Each decision below includes the reasoning.

- **Authentication is out of scope** → identity is passed as an `x-user-id` header and chosen with a frontend **user switcher** over seeded demo users. *Why:* auth was explicitly agreed to be unnecessary for this exercise; a header + switcher keeps per-user wallets/carts/orders demonstrable without building login.
- **SQLite as the database** → file-based, zero-setup, matches "a local SQL DB for testing." *Why:* fastest to run locally; Prisma makes swapping to Postgres a one-line datasource change.
- **Coins are credited 1:1 with USD**, with fixed packages $20/$50/$100. *Why:* the spec defined it this way; the rate lives in the seeded `coin_packages` so it's easy to change.
- **Payment is fully mocked but production-shaped** (intent → redirect → confirm/webhook → credit). *Why:* exercises the real concerns — idempotency, redirection, confirmation — without a real payment provider.
- **Card details are never transmitted.** The mock gateway's card form is a pure UI simulation; only `confirm` is called. *Why:* there is no real gateway, and handling card data would be both pointless and unsafe.
- **Gold Coins are the only accepted currency** for products; USD only ever buys coins. *Why:* core product rule.
- **Price snapshots on order/cart items** are deliberate (see 3NF section). *Why:* historical orders must not change when catalog prices change.
- **Digital goods have unlimited stock.** *Why:* skins/emotes/passes are digital; the meaningful shared resource to guard is the wallet balance, which is where concurrency control is focused.
- **One active cart and one wallet per user**, created at seed time. *Why:* simplest correct model for this scope.

---

## Trade-offs & what I'd do in real production

- **Database:** SQLite serializes writes, which is fine here and makes the optimistic lock easy to demonstrate. In production I'd use **Postgres** and could additionally use `SELECT ... FOR UPDATE` (pessimistic row locks) under high contention, or keep the optimistic lock with a bounded retry.
- **Conflict retries:** a `409` from the optimistic lock is surfaced to the client today. In production I'd add a small automatic retry-with-backoff around the transaction so transient races are invisible to the user.
- **Payments:** a real integration (e.g. Stripe) would use the provider's hosted checkout, verify **webhook signatures**, and reconcile asynchronously. The shape here (intent → redirect → webhook → fulfilment) maps directly onto that.
- **Auth:** replace the `x-user-id` header with real authentication (JWT/session) and derive the user server-side; the header is isolated to one decorator, so this is a contained change.
- **Idempotency store:** today keys live as unique columns on the money tables. A dedicated idempotency-keys table (storing the stored response per key, with TTL) would generalise this across all endpoints.
```
