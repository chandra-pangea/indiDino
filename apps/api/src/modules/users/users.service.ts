// Business logic for reading the seeded demo users (used by the frontend user switcher).
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns all users ordered by display name.
  async findAll() {
    return this.prisma.user.findMany({ orderBy: { displayName: 'asc' } });
  }

  // Returns a single user by id or throws 404.
  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User "${userId}" not found.`);
    return user;
  }
}
