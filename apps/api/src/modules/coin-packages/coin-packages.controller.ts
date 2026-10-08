// HTTP routes for listing coin packages.
import { Controller, Get } from '@nestjs/common';
import { CoinPackagesService } from './coin-packages.service';

@Controller('coin-packages')
export class CoinPackagesController {
  constructor(private readonly coinPackagesService: CoinPackagesService) {}

  // GET /api/coin-packages — list all active coin packages.
  @Get()
  findAll() {
    return this.coinPackagesService.findAll();
  }
}
