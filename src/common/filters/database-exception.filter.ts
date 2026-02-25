import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Global exception filter for database errors.
 * Catches TypeORM QueryFailedError and maps PostgreSQL error codes
 * to appropriate HTTP responses with user-friendly messages.
 *
 * Replaces duplicated `handleExceptions()` methods across services.
 */
@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const driverError = exception.driverError as {
      code?: string;
      detail?: string;
    };

    const { status, message } = this.mapError(driverError);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapError(driverError: { code?: string; detail?: string }): {
    status: number;
    message: string;
  } {
    switch (driverError.code) {
      case '23505': // unique_violation
        this.logger.error(`Unique violation: ${driverError.detail}`);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'A record with this information already exists',
        };

      case '23503': // foreign_key_violation
        this.logger.error(`Foreign key violation: ${driverError.detail}`);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference to related entity',
        };

      case '23502': // not_null_violation
        this.logger.error(`Not null violation: ${driverError.detail}`);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Required field is missing',
        };

      case '22001': // string_data_right_truncation
        this.logger.error(`String too long: ${driverError.detail}`);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Input value exceeds maximum length',
        };

      case '22P02': // invalid_text_representation
        this.logger.error(`Invalid input syntax: ${driverError.detail}`);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid input format',
        };

      case '42703': // undefined_column
        this.logger.error(`Undefined column: ${driverError.detail}`);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Query references a non-existent column',
        };

      default:
        this.logger.error(
          `Unhandled database error [${driverError.code}]: ${driverError.detail}`,
        );
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error, check server logs',
        };
    }
  }
}
