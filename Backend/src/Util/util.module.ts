import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { CloudinaryService } from './cloudinary.service';
import { TransformService } from './transform.service';
@Global()
@Module({
  imports: [ConfigModule],
  providers: [EmailService, CloudinaryService, TransformService],
  exports: [EmailService, CloudinaryService, TransformService],
})
export class UtilModule {}
