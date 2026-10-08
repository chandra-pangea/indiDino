// Param decorator that extracts the active user id from the `x-user-id` request header.
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

// Returns the x-user-id header value, throwing 400 if the caller did not supply it.
export const CurrentUserId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest();
  const userId = request.headers['x-user-id'];
  if (!userId || typeof userId !== 'string') {
    throw new BadRequestException('Missing required "x-user-id" header.');
  }
  return userId;
});
