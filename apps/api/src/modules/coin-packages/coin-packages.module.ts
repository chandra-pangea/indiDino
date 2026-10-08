// Module bundling the coin-packages controller and service; exports the service for payments to reuse.
import { Module } from '@nestjs/common';
import { CoinPackagesController } from './coin-packages.controller';
import { CoinPackagesService } from './coin-packages.service';

@Module({
  controllers: [CoinPackagesController],
  providers: [CoinPackagesService],
  exports: [CoinPackagesService],
})
export class CoinPackagesModule {}
