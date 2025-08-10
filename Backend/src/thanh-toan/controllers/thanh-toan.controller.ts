import { Controller, Get, Query } from '@nestjs/common';
import { ThanhToanService } from '../services/thanh-toan.service';

@Controller('api/payments')
export class ThanhToanController {
  constructor(private readonly ThanhToanService: ThanhToanService) {}
  @Get('remake-payment')
  async remakePayment(
    @Query('orderId') orderId: string,
    @Query('amount') amountStr: string,
    @Query('userId') userIdStr: string
  ) {
    const amount = parseInt(amountStr);
    const userId = parseInt(userIdStr);

    return await this.ThanhToanService.update(orderId, amount, userId);
  }
}
