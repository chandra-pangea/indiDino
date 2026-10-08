// Application bootstrap: creates the Nest app, applies global pipes/filters, enables CORS, and listens.
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

// Boots the HTTP server for the Coin Vault API.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Reject unknown properties and auto-transform payloads into DTO instances.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Normalise every error response through a single filter.
  app.useGlobalFilters(new AllExceptionsFilter());

  // Prefix all routes with /api for a clean namespace.
  app.setGlobalPrefix('api');

  // Allow the web app origin(s) and the headers the client sends.
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(','),
    allowedHeaders: ['Content-Type', 'x-user-id', 'Idempotency-Key'],
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  new Logger('Bootstrap').log(`Coin Vault API listening on http://localhost:${port}/api`);
}

bootstrap();
