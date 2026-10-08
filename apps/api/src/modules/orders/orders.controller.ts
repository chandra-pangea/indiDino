// HTTP routes for placing and reading orders.
import { Controller, Get, Post, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUserId } from '../../common/current-user.decorator';
import { IdempotencyKey } from '../../common/idempotency.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /api/orders — place an order from the cart (requires Idempotency-Key header).
  @Post()
  placeOrder(@CurrentUserId() userId: string, @IdempotencyKey() idempotencyKey: string) {
    return this.ordersService.placeOrder(userId, idempotencyKey);
  }

  // GET /api/orders — list the current user's orders.
  @Get()
  findAll(@CurrentUserId() userId: string) {
    return this.ordersService.findAll(userId);
  }

  // GET /api/orders/:id — fetch one order.
  @Get(':id')
  findOne(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.ordersService.findOne(userId, id);
  }
}
