// Cart business logic: read the cart, add/update/remove line items, and clear it.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns the user's cart with items and product details (totals computed for convenience).
  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } },
    });
    if (!cart) throw new NotFoundException(`Cart for user "${userId}" not found.`);
    return this.withTotals(cart);
  }

  // Adds a product to the cart, merging quantity if it is already present.
  async addItem(userId: string, productId: string, quantity = 1) {
    const cart = await this.requireCart(userId);
    await this.requireActiveProduct(productId);

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });

    return this.getCart(userId);
  }

  // Sets the absolute quantity of a line item, removing it when quantity is 0.
  async updateItem(userId: string, productId: string, quantity: number) {
    const cart = await this.requireCart(userId);

    if (quantity === 0) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
      return this.getCart(userId);
    }

    const item = await this.prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } });
    if (!item) throw new NotFoundException(`Product "${productId}" is not in the cart.`);

    await this.prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    return this.getCart(userId);
  }

  // Removes a single product from the cart.
  async removeItem(userId: string, productId: string) {
    const cart = await this.requireCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return this.getCart(userId);
  }

  // Removes every item from the cart.
  async clearCart(userId: string) {
    const cart = await this.requireCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }

  // Loads the user's cart record or throws 404.
  private async requireCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException(`Cart for user "${userId}" not found.`);
    return cart;
  }

  // Ensures the product exists and is active before it can be added.
  private async requireActiveProduct(productId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, isActive: true } });
    if (!product) throw new NotFoundException(`Product "${productId}" not found.`);
    return product;
  }

  // Attaches derived totals (item count and coin total) to a cart payload.
  private withTotals<T extends { items: { quantity: number; product: { priceCoins: number } }[] }>(cart: T) {
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCoins = cart.items.reduce((sum, item) => sum + item.quantity * item.product.priceCoins, 0);
    return { ...cart, totalItems, totalCoins };
  }
}
