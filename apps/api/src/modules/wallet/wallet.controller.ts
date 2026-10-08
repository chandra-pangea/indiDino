// HTTP routes for reading the active user's wallet and ledger.
import { Controller, Get } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CurrentUserId } from '../../common/current-user.decorator';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // GET /api/wallet — current user's wallet balance.
  @Get()
  getWallet(@CurrentUserId() userId: string) {
    return this.walletService.getByUserId(userId);
  }

  // GET /api/wallet/transactions — current user's ledger history.
  @Get('transactions')
  getTransactions(@CurrentUserId() userId: string) {
    return this.walletService.getTransactions(userId);
  }
}
