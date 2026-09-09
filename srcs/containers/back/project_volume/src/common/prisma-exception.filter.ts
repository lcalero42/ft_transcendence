import {
  ArgumentsHost,
  Catch,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case 'P2025':
        return super.catch(new NotFoundException('Record not found'), host);
      case 'P2002':
        return super.catch(new ConflictException('Already exists'), host);
      case 'P2003':
        return super.catch(new BadRequestException('Related record does not exist'), host);
      default:
        return super.catch(exception, host);
    }
  }
}
