// Order business logic: place an order from the cart (atomic + idempotent) and read order history.
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { OrderStatus, WalletReferenceType } from '../../common/enums';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  // Places an order from the user's cart: debits the wallet, records the order, and empties the cart.
  async placeOrder(userId: string, idempotencyKey: string) {
    // Idempotency: a previous order for this key is returned without charging again.
    const existing = await this.prisma.order.findUnique({ where: { idempotencyKey }, include: { items: true } });
    if (existing) return existing;

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      throw new UnprocessableEntityException('Cart is empty.');
    }

    // Snapshot line prices and compute the total at order time.
    const lineItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPriceCoins: item.product.priceCoins,
    }));
    const totalCoins = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceCoins, 0);

    const wallet = await this.walletService.getByUserId(userId);

    try {
      // Debit wallet, create the order+items, and clear the cart — all or nothing.
      return await this.prisma.$transaction(async (tx) => {
        await this.walletService.debit(tx, wallet.id, totalCoins, WalletReferenceType.ORDER, idempotencyKey);

        const order = await tx.order.create({
          data: {
            userId,
            status: OrderStatus.PAID,
            totalCoins,
            idempotencyKey,
            items: { create: lineItems },
          },
          include: { items: true },
        });

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return order;
      });
    } catch (error) {
      // If two identical requests raced, the loser hits the unique key — return the winner's order.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const winner = await this.prisma.order.findUnique({ where: { idempotencyKey }, include: { items: true } });
        if (winner) return winner;
      }
      throw error;
    }
  }

  // Returns the user's orders (newest first) with their line items and product details.
  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Returns a single order owned by the user, or throws 404.
  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException(`Order "${orderId}" not found.`);
    return order;
  }
}
