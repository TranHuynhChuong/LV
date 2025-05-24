import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Lỗi hệ thống';

    // Log lỗi ra console hoặc file
    this.logger.error(
      `HTTP Status: ${status} Error Message: ${
        exception instanceof Error
          ? exception.message
          : JSON.stringify(exception)
      }`,
      exception instanceof Error ? exception.stack : ''
    );

    // Trả về response chuẩn
    response.status(status).json(message);
  }
}
