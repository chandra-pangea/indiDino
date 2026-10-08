// HTTP routes for the coin-purchase payment flow.
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUserId } from '../../common/current-user.decorator';
import { IdempotencyKey } from '../../common/idempotency.decorator';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // POST /api/payments/intents — create a payment intent (requires Idempotency-Key header).
  @Post('intents')
  createIntent(
    @CurrentUserId() userId: string,
    @IdempotencyKey() idempotencyKey: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createIntent(userId, dto.coinPackageId, idempotencyKey);
  }

  // GET /api/payments/:id — fetch a payment's current status.
  @Get(':id')
  getById(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.paymentsService.getById(userId, id);
  }

  // POST /api/payments/:id/confirm — simulated gateway confirmation that credits the wallet.
  @Post(':id/confirm')
  confirm(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.paymentsService.confirm(userId, id);
  }

  // POST /api/payments/:id/cancel — cancel a pending payment.
  @Post(':id/cancel')
  cancel(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.paymentsService.cancel(userId, id);
  }
}
