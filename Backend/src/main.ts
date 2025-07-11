import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ExceptionLoggingFilter } from './ExceptionLoggingFilter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const frontendUrls = configService.get<string[]>('frontend.urls');

  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });
  app.use(cookieParser());

  app.use(morgan('dev'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.useGlobalFilters(new ExceptionLoggingFilter());
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
}

bootstrap();
