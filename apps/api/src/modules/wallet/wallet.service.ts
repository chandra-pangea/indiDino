// Wallet business logic: balance reads, ledger history, and the atomic credit/debit used by payments and orders.
import { Injectable, NotFoundException, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletTransactionType, WalletReferenceType } from '../../common/enums';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns the wallet for a user or throws 404.
  async getByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException(`Wallet for user "${userId}" not found.`);
    return wallet;
  }

  // Returns the wallet's ledger entries, newest first.
  async getTransactions(userId: string) {
    const wallet = await this.getByUserId(userId);
    return this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Credits coins to a wallet within a transaction and records a CREDIT ledger entry.
  async credit(
    tx: Prisma.TransactionClient,
    walletId: string,
    amountCoins: number,
    referenceType: WalletReferenceType,
    referenceId: string,
  ): Promise<number> {
    return this.applyBalanceChange(tx, walletId, amountCoins, WalletTransactionType.CREDIT, referenceType, referenceId);
  }

  // Debits coins from a wallet within a transaction and records a DEBIT ledger entry.
  async debit(
    tx: Prisma.TransactionClient,
    walletId: string,
    amountCoins: number,
    referenceType: WalletReferenceType,
    referenceId: string,
  ): Promise<number> {
    return this.applyBalanceChange(tx, walletId, -amountCoins, WalletTransactionType.DEBIT, referenceType, referenceId);
  }

  // Applies a signed balance delta under optimistic locking (version check) and appends a ledger row.
  private async applyBalanceChange(
    tx: Prisma.TransactionClient,
    walletId: string,
    delta: number,
    type: WalletTransactionType,
    referenceType: WalletReferenceType,
    referenceId: string,
  ): Promise<number> {
    // Read the current balance and version inside the transaction.
    const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new NotFoundException(`Wallet "${walletId}" not found.`);

    // Reject the change if it would overdraw the wallet.
    const newBalance = wallet.balanceCoins + delta;
    if (newBalance < 0) {
      throw new UnprocessableEntityException('Insufficient Gold Coin balance.');
    }

    // Commit the new balance only if the version is unchanged (no concurrent writer won the race).
    const updated = await tx.wallet.updateMany({
      where: { id: walletId, version: wallet.version },
      data: { balanceCoins: newBalance, version: { increment: 1 } },
    });
    if (updated.count === 0) {
      throw new ConflictException('Wallet was modified concurrently, please retry.');
    }

    // Append an immutable ledger entry recording the resulting balance.
    await tx.walletTransaction.create({
      data: {
        walletId,
        type,
        amountCoins: Math.abs(delta),
        balanceAfter: newBalance,
        referenceType,
        referenceId,
      },
    });

    return newBalance;
  }
}
