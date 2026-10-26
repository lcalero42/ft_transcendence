import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { colyseusServer } from './colyseus/server';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { requireEnv } from './common/require-env';
import cookieParser from 'cookie-parser';
import { csrfOriginCheck } from './common/csrf-origin.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.set('case sensitive routing', true);
  app.enableCors({
    origin: requireEnv('CORS_ORIGIN'),
  });
  app.use(cookieParser());
  app.use(csrfOriginCheck(requireEnv('CORS_ORIGIN')));
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(
    new PrismaExceptionFilter(app.get(HttpAdapterHost).httpAdapter),
  );
  await colyseusServer.listen(2567);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
