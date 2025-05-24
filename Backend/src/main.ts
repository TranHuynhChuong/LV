import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './app.all-exceptions-filter';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors();
  app.use(morgan('dev'));
  app.useGlobalFilters(new AllExceptionsFilter());
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
}

bootstrap();
