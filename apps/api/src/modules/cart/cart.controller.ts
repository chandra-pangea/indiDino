// HTTP routes for managing the active user's cart.
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUserId } from '../../common/current-user.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /api/cart — the current user's cart with totals.
  @Get()
  getCart(@CurrentUserId() userId: string) {
    return this.cartService.getCart(userId);
  }

  // POST /api/cart/items — add a product to the cart.
  @Post('items')
  addItem(@CurrentUserId() userId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(userId, dto.productId, dto.quantity ?? 1);
  }

  // PATCH /api/cart/items/:productId — set the quantity of a cart item.
  @Patch('items/:productId')
  updateItem(@CurrentUserId() userId: string, @Param('productId') productId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(userId, productId, dto.quantity);
  }

  // DELETE /api/cart/items/:productId — remove a product from the cart.
  @Delete('items/:productId')
  removeItem(@CurrentUserId() userId: string, @Param('productId') productId: string) {
    return this.cartService.removeItem(userId, productId);
  }

  // DELETE /api/cart — empty the cart.
  @Delete()
  clearCart(@CurrentUserId() userId: string) {
    return this.cartService.clearCart(userId);
  }
}
