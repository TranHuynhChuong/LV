import { ThanhToanRepository } from '../repositories/thanh-toan.repository';
import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { ZaloPayService } from './zalo-pay.service';
import * as moment from 'moment';

@Injectable()
export class ThanhToanService {
  constructor(
    private readonly ThanhToanRepository: ThanhToanRepository,
    private readonly ZaloPayService: ZaloPayService
  ) {}

  async create(
    orderId: string,
    appTransId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.ThanhToanRepository.create(
      {
        DH_id: orderId,
        TT_id: appTransId,
        TT_daThanhToan: false,
        TT_phuongThuc: 'ZaloPay',
      },
      session
    );
  }

  async update(orderId: string, amount: number, userId: number) {
    try {
      const transId = `${moment().format('YYMMDDHHmmssSSS')}${orderId}`;
      await this.ThanhToanRepository.update(orderId, undefined, transId);
      const result = await this.ZaloPayService.create(
        orderId,
        transId,
        amount,
        userId,
        `/profile/order`
      );

      return { order_url: result.order_url };
    } catch (error: any) {
      // Trả về lỗi dạng object hoặc message tùy ý
      return { error: error.message || 'Lỗi khi tạo lại đơn thanh toán' };
    }
  }
}
