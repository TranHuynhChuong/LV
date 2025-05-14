import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); // Lấy instance của ConfigService

  const port = configService.get<number>('app.port', 3000); // Lấy cổng từ cấu hình hoặc mặc định là 3000
  await app.listen(port); // Lắng nghe trên cổng lấy từ cấu hình
}
bootstrap();
