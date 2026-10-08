// Business logic for reading the purchasable coin packages.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoinPackagesService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns all active coin packages ordered for display.
  async findAll() {
    return this.prisma.coinPackage.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  // Returns a single active coin package by id or throws 404.
  async findActiveOrThrow(id: string) {
    const coinPackage = await this.prisma.coinPackage.findFirst({ where: { id, isActive: true } });
    if (!coinPackage) throw new NotFoundException(`Coin package "${id}" not found.`);
    return coinPackage;
  }
}
