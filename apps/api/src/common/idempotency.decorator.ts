// Param decorator that extracts the `Idempotency-Key` header used to make unsafe POSTs retry-safe.
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

// Returns the Idempotency-Key header value, throwing 400 if it is absent.
export const IdempotencyKey = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest();
  const key = request.headers['idempotency-key'];
  if (!key || typeof key !== 'string') {
    throw new BadRequestException('Missing required "Idempotency-Key" header.');
  }
  return key;
});
