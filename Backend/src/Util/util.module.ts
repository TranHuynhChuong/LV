import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { CloudinaryService } from './cloudinary.service';
import { TransformService } from './transform.service';
import { ExportService } from './export';
@Global()
@Module({
  imports: [ConfigModule],
  providers: [EmailService, CloudinaryService, TransformService, ExportService],
  exports: [EmailService, CloudinaryService, TransformService, ExportService],
})
export class UtilModule {}
