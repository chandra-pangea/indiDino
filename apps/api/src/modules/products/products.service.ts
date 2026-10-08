// Business logic for reading the product catalog and categories.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns active products, optionally filtered by category slug, with their category attached.
  async findAll(categorySlug?: string) {
    return this.prisma.product.findMany({
      where: { isActive: true, ...(categorySlug ? { category: { slug: categorySlug } } : {}) },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  // Returns a single active product by id or throws 404.
  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({ where: { id, isActive: true }, include: { category: true } });
    if (!product) throw new NotFoundException(`Product "${id}" not found.`);
    return product;
  }

  // Returns all product categories.
  async findCategories() {
    return this.prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
  }
}
