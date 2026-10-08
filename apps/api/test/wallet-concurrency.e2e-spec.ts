// Proves the wallet's optimistic lock prevents overdraft and double-spend under concurrent debits.
import { PrismaService } from '../src/prisma/prisma.service';
import { WalletService } from '../src/modules/wallet/wallet.service';
import { WalletReferenceType, WalletTransactionType } from '../src/common/enums';

describe('Wallet concurrency', () => {
  const prisma = new PrismaService();
  const walletService = new WalletService(prisma);
  const userId = 'test-conc-user';

  // Create a dedicated user + wallet funded with exactly 100 coins before the test.
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: {
        id: userId,
        displayName: 'Concurrency Tester',
        email: 'concurrency@test.local',
        wallet: { create: { balanceCoins: 100 } },
      },
    });
  });

  // Remove the test rows afterwards so the dev database stays clean.
  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  // Fire 10 concurrent debits of 50 coins at a 100-coin wallet and assert the invariants hold.
  it('never overdraws the wallet when many debits race', async () => {
    const wallet = await walletService.getByUserId(userId);

    const attempts = Array.from({ length: 10 }, (_, index) =>
      prisma
        .$transaction((tx) => walletService.debit(tx, wallet.id, 50, WalletReferenceType.ORDER, `race-${index}`))
        .then(() => true)
        .catch(() => false),
    );
    const results = await Promise.all(attempts);
    const successCount = results.filter(Boolean).length;

    const finalWallet = await walletService.getByUserId(userId);
    const debitEntries = await prisma.walletTransaction.count({
      where: { walletId: wallet.id, type: WalletTransactionType.DEBIT },
    });

    // At most two 50-coin debits can succeed against a 100-coin balance.
    expect(successCount).toBeLessThanOrEqual(2);
    // The balance must never go negative.
    expect(finalWallet.balanceCoins).toBeGreaterThanOrEqual(0);
    // Coins removed must exactly match the successful debits — no lost or phantom updates.
    expect(finalWallet.balanceCoins).toBe(100 - successCount * 50);
    // The ledger must hold exactly one entry per successful debit.
    expect(debitEntries).toBe(successCount);
  });

  // Deletes the test user, wallet, and ledger rows.
  async function cleanup() {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (wallet) await prisma.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
    await prisma.wallet.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  }
});
