import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES, ErrorCode } from '../../shared/constants/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request & { correlationId?: string }>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : null;

        const message =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any)?.message || exception.message || 'An unexpected error occurred';

        const errorCode = (exceptionResponse as any)?.code || this.getErrorCode(status);

        const errorResponse: any = {
            statusCode: status,
            errorCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            correlationId: request.correlationId || 'unknown',
        };

        // include stack trace only in dev environment
        if (process.env.NODE_ENV !== 'production' && exception.stack) {
            errorResponse.stack = exception.stack;
        }

        this.logger.error(
            `${request.method} ${request.url} - ${status} - [${errorResponse.correlationId}]`,
            exception.stack || JSON.stringify(errorResponse),
        );

        response.status(status).json(errorResponse);
    }

    private getErrorCode(status: number): ErrorCode {
        switch (status) {
            case HttpStatus.UNAUTHORIZED: return ERROR_CODES.AUTH_UNAUTHORIZED;
            case HttpStatus.FORBIDDEN: return ERROR_CODES.AUTH_FORBIDDEN;
            case HttpStatus.NOT_FOUND: return ERROR_CODES.RESOURCE_NOT_FOUND;
            case HttpStatus.CONFLICT: return ERROR_CODES.RESOURCE_CONFLICT;
            case HttpStatus.BAD_REQUEST: return ERROR_CODES.VALIDATION_FAILED;
            default: return ERROR_CODES.SERVER_INTERNAL_ERROR;
        }
    }
}
