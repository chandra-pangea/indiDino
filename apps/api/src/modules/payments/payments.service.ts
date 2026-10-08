// Payment business logic: create an intent, then confirm (credit wallet) or cancel it — all retry-safe.
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CoinPackagesService } from '../coin-packages/coin-packages.service';
import { PaymentStatus, WalletReferenceType } from '../../common/enums';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly coinPackagesService: CoinPackagesService,
  ) {}

  // Creates (or re-returns, if the idempotency key was seen) a PENDING payment and its mock redirect URL.
  async createIntent(userId: string, coinPackageId: string, idempotencyKey: string) {
    // Idempotency: an existing payment for this key is returned unchanged.
    const existing = await this.prisma.payment.findUnique({ where: { idempotencyKey } });
    if (existing) return this.toIntentResponse(existing);

    const coinPackage = await this.coinPackagesService.findActiveOrThrow(coinPackageId);

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        coinPackageId: coinPackage.id,
        amountCents: coinPackage.priceCents,
        coins: coinPackage.coins,
        status: PaymentStatus.PENDING,
        idempotencyKey,
        providerRef: `mock_${idempotencyKey}`,
      },
    });

    return this.toIntentResponse(payment);
  }

  // Returns a single payment owned by the user, or throws 404.
  async getById(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, userId } });
    if (!payment) throw new NotFoundException(`Payment "${paymentId}" not found.`);
    return payment;
  }

  // Confirms a payment (the simulated gateway webhook): marks it COMPLETED and credits the wallet atomically.
  async confirm(userId: string, paymentId: string) {
    const payment = await this.getById(userId, paymentId);

    // Idempotent: confirming an already-completed payment never credits twice.
    if (payment.status === PaymentStatus.COMPLETED) {
      return this.getById(userId, paymentId);
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException(`Payment cannot be confirmed from status "${payment.status}".`);
    }

    const wallet = await this.walletService.getByUserId(userId);

    // Flip status and credit the wallet in one transaction so they always agree.
    await this.prisma.$transaction(async (tx) => {
      const locked = await tx.payment.updateMany({
        where: { id: paymentId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.COMPLETED },
      });
      // If no row flipped, a concurrent confirm already handled it — stop to avoid a double credit.
      if (locked.count === 0) throw new ConflictException('Payment was already processed.');

      await this.walletService.credit(tx, wallet.id, payment.coins, WalletReferenceType.PAYMENT, payment.id);
    });

    return this.getById(userId, paymentId);
  }

  // Cancels a still-pending payment.
  async cancel(userId: string, paymentId: string) {
    const payment = await this.getById(userId, paymentId);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException(`Payment cannot be cancelled from status "${payment.status}".`);
    }
    await this.prisma.payment.update({ where: { id: paymentId }, data: { status: PaymentStatus.CANCELLED } });
    return this.getById(userId, paymentId);
  }

  // Shapes a payment into the intent response, adding the frontend mock-gateway redirect URL.
  private toIntentResponse(payment: { id: string } & Record<string, unknown>) {
    return { ...payment, redirectUrl: `/checkout/mock/${payment.id}` };
  }
}
