// Root module wiring Prisma and every feature module together.
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CoinPackagesModule } from './modules/coin-packages/coin-packages.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    WalletModule,
    CoinPackagesModule,
    PaymentsModule,
    ProductsModule,
    CartModule,
    OrdersModule,
  ],
})
export class AppModule {}
