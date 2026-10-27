import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { colyseusServer } from './colyseus/server';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { requireEnv } from './common/require-env';
import { PrismaService } from './prisma.service';
import { setPrisma } from './colyseus/prisma';
import cookieParser from 'cookie-parser';
import { csrfOriginCheck } from './common/csrf-origin.middleware';
import { apiError } from './common/api-error';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks([], { useProcessExit: true });
  setPrisma(app.get(PrismaService));
  app.set('trust proxy', 1);
  app.set('case sensitive routing', true);
  app.enableCors({
    origin: requireEnv('CORS_ORIGIN'),
  });
  app.use(cookieParser());
  app.use(csrfOriginCheck(requireEnv('CORS_ORIGIN')));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException(
          apiError(
            'VALIDATION_FAILED',
            errors
              .flatMap((error) => Object.values(error.constraints ?? {}))
              .join(', '),
          ),
        ),
    }),
  );
  app.useGlobalFilters(
    new PrismaExceptionFilter(app.get(HttpAdapterHost).httpAdapter),
  );
  await colyseusServer.listen(2567);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
