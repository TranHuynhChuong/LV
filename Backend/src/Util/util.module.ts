import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, CloudinaryService],
  exports: [EmailService, CloudinaryService],
})
export class UtilModule {}
