// Module bundling the payments controller and service; depends on wallet and coin-packages services.
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { WalletModule } from '../wallet/wallet.module';
import { CoinPackagesModule } from '../coin-packages/coin-packages.module';

@Module({
  imports: [WalletModule, CoinPackagesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
