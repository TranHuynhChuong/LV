import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExceptionLoggingFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionLoggingFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessage = 'Lỗi hệ thống';
    let errorDetail: any = {};

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorMessage =
        typeof res === 'string' ? res : (res as any).message || errorMessage;
      errorDetail = res;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorDetail = {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    // Ghi log chi tiết vào console hoặc file log
    this.logger.error(
      `[${request.method}] ${request.url} | Status: ${status}\n` +
        `Message: ${errorMessage}\n` +
        `Detail: ${JSON.stringify(errorDetail, null, 2)}\n` +
        (exception instanceof Error ? `Stack:\n${exception.stack}` : '')
    );

    // Trả về cho client thông tin đơn giản
    response.status(status).json({
      statusCode: status,
      message: errorMessage,
    });
  }
}
