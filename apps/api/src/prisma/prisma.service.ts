// Wraps the Prisma client as an injectable Nest provider and manages its connection lifecycle.
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Opens the database connection when the module starts.
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  // Closes the database connection when the module is destroyed.
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
