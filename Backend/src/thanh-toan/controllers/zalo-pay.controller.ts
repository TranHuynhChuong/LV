import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ZaloPayService } from '../services/zalo-pay.service';

@Controller('zalopay')
export class ZaloPayController {
  constructor(private readonly zaloPayService: ZaloPayService) {}
  @Post('callback')
  async handleCallback(@Body() body: any, @Res() res: Response) {
    try {
      const { data, mac } = body;
      const result = await this.zaloPayService.handleCallback(data, mac);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        return_code: 0,
        return_message: error.message || 'Internal Server Error',
      });
    }
  }
}
