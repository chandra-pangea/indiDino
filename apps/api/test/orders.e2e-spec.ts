// Verifies order placement is idempotent and blocks purchases that exceed the wallet balance.
import { PrismaService } from '../src/prisma/prisma.service';
import { WalletService } from '../src/modules/wallet/wallet.service';
import { OrdersService } from '../src/modules/orders/orders.service';

describe('Order placement', () => {
  const prisma = new PrismaService();
  const walletService = new WalletService(prisma);
  const ordersService = new OrdersService(prisma, walletService);
  const userId = 'test-order-user';
  let productId: string;

  // Build a user with a wallet, a product, and a cart containing that product.
  beforeAll(async () => {
    await cleanup();
    const category = await prisma.productCategory.create({ data: { name: 'Test Cat', slug: 'test-cat' } });
    const product = await prisma.product.create({
      data: { sku: 'TEST-SKU', name: 'Test Skin', description: 'test', categoryId: category.id, priceCoins: 30, imageUrl: 'x' },
    });
    productId = product.id;
    await prisma.user.create({
      data: {
        id: userId,
        displayName: 'Order Tester',
        email: 'order@test.local',
        wallet: { create: { balanceCoins: 50 } },
        cart: { create: { items: { create: { productId, quantity: 1 } } } },
      },
    });
  });

  // Remove every test row afterwards.
  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  // Placing the same order twice with one key must charge the wallet only once.
  it('is idempotent for a repeated idempotency key', async () => {
    const first = await ordersService.placeOrder(userId, 'order-key-1');
    const second = await ordersService.placeOrder(userId, 'order-key-1');

    expect(second.id).toBe(first.id);
    const wallet = await walletService.getByUserId(userId);
    expect(wallet.balanceCoins).toBe(20); // 50 - 30, debited exactly once.
  });

  // An order larger than the balance must be rejected.
  it('rejects an order the wallet cannot afford', async () => {
    // Refill the cart (the previous order emptied it) with an item worth more than the remaining 20 coins.
    const cart = await prisma.cart.findUniqueOrThrow({ where: { userId } });
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity: 1 } });

    await expect(ordersService.placeOrder(userId, 'order-key-2')).rejects.toThrow(/Insufficient/);
  });

  // Deletes all rows created for this suite in dependency order.
  async function cleanup() {
    await prisma.orderItem.deleteMany({ where: { order: { userId } } });
    await prisma.order.deleteMany({ where: { userId } });
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.deleteMany({ where: { userId } });
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (wallet) await prisma.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
    await prisma.wallet.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.product.deleteMany({ where: { sku: 'TEST-SKU' } });
    await prisma.productCategory.deleteMany({ where: { slug: 'test-cat' } });
  }
});
