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
    transId: string,
    amount: number,
    userId: number,
    method: string,
    subRedirectUrl: string = '/cart',
    session?: ClientSession
  ) {
    try {
      await this.ThanhToanRepository.create(
        {
          DH_id: orderId,
          TT_id: transId,
          TT_daThanhToan: false,
          TT_phuongThuc: 'ZaloPay',
        },
        session
      );
      if (method === 'ZaloPay') {
        const result = await this.ZaloPayService.create(
          orderId,
          transId,
          amount,
          userId,
          subRedirectUrl
        );
        return result;
      }
    } catch (error: any) {
      if (error.response?.data) throw error.response.data;
      throw error.message || error;
    }
  }

  async update(
    orderId: string,
    amount: number,
    userId: number,
    method: string
  ) {
    try {
      const transId = `${moment().format('YYMMDDHHmmssSSS')}${orderId}`;
      if (method === 'ZaloPay') {
        await this.ThanhToanRepository.update(orderId, undefined, transId);
        const result = await this.ZaloPayService.create(
          orderId,
          transId,
          amount,
          userId,
          `/profile/order`
        );
        return { order_url: result.order_url };
      }
    } catch (error: any) {
      if (error.response?.data) throw error.response.data;
      throw error.message || error;
    }
  }

  async queryOrder(orderId: string) {
    let payment = await this.ThanhToanRepository.findByByOrderId(orderId);
    if (!payment) return null;
    try {
      if (payment.TT_phuongThuc === 'ZaloPay') {
        payment = await this.ZaloPayService.queryOrder(orderId);
        return payment;
      }
    } catch (error: any) {
      if (error.response?.data) throw error.response.data;
      throw error.message || error;
    }
  }
}
