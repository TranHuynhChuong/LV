import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class ExceptionLoggingFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionLoggingFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Lỗi hệ thống';

    this.logger.error(
      `${
        exception instanceof Error
          ? `Message: ${exception.message}`
          : `Raw: ${JSON.stringify(exception)}`
      }`,
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(status).json({
      message,
    });
  }
}
