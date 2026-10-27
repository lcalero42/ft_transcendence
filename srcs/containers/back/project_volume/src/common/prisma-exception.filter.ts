import {
  ArgumentsHost,
  Catch,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../generated/prisma/client';
import { apiError } from './api-error';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case 'P2025':
        return super.catch(
          new NotFoundException(
            apiError('RECORD_NOT_FOUND', 'Record not found'),
          ),
          host,
        );
      case 'P2002':
        return super.catch(
          new ConflictException(apiError('ALREADY_EXISTS', 'Already exists')),
          host,
        );
      case 'P2003':
        return super.catch(
          new BadRequestException(
            apiError('RELATED_RECORD_MISSING', 'Related record does not exist'),
          ),
          host,
        );
      default:
        return super.catch(exception, host);
    }
  }
}
