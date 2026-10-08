// Module bundling the orders controller and service; depends on the wallet service for debits.
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
