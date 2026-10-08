// HTTP routes for browsing the product catalog and categories.
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /api/products?category=slug — list products, optionally filtered by category.
  @Get('products')
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  // GET /api/product-categories — list all categories.
  @Get('product-categories')
  findCategories() {
    return this.productsService.findCategories();
  }

  // GET /api/products/:id — fetch one product.
  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
