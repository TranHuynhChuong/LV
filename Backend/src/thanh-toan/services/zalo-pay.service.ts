import { ThanhToanRepository } from '../repositories/thanh-toan.repository';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import * as qs from 'qs';
import axios from 'axios';
@Injectable()
export class ZaloPayService {
  private readonly appId: string;
  private readonly key1: string;
  private readonly key2: string;
  private readonly createEndpoint: string;
  private readonly queryEndpoint: string;
  private readonly backendUrl: string;
  private readonly redirectUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly ThanhToanRepository: ThanhToanRepository
  ) {
    this.appId = this.configService.get<string>('zaloPay.appId') ?? '';
    this.key1 = this.configService.get<string>('zaloPay.key1') ?? '';
    this.key2 = this.configService.get<string>('zaloPay.key2') ?? '';
    this.createEndpoint =
      this.configService.get<string>('zaloPay.createEndpoint') ?? '';
    this.queryEndpoint =
      this.configService.get<string>('zaloPay.queryEndpoint') ?? '';
    this.backendUrl = this.configService.get<string>('app.url') ?? '';
    const url =
      (this.configService.get<string[]>('frontend.urls') ?? [])[1] ?? '';
    this.redirectUrl = url ? url.replace(/\/$/, '') : '';

    if (!this.appId) throw new Error('Missing config: zaloPay.appId');
    if (!this.key1) throw new Error('Missing config: zaloPay.key1');
    if (!this.key2) throw new Error('Missing config: zaloPay.key2');
    if (!this.createEndpoint)
      throw new Error('Missing config: zaloPay.createEndpoint');
    if (!this.queryEndpoint)
      throw new Error('Missing config: zaloPay.queryEndpoint');
    if (!this.backendUrl) throw new Error('Missing config: app.url');
    if (!this.redirectUrl) throw new Error('Missing config: frontend.urls');
  }

  async create(
    orderId: string,
    transId: string,
    amount: number,
    userId: number,
    subRedirectUrl: string = '/cart'
  ): Promise<{ order_url: string }> {
    const embedData = { redirecturl: this.redirectUrl + subRedirectUrl };
    const items = [{}];
    const appTransId = transId;
    const appUser = userId.toString();
    const appTime = Date.now();
    const description = `Dật Lạc - Thanh toán đơn hàng #${orderId}`;
    const data = [
      this.appId,
      appTransId,
      appUser,
      amount,
      appTime,
      JSON.stringify(embedData),
      JSON.stringify(items),
    ].join('|');
    const mac = CryptoJS.HmacSHA256(data, this.key1).toString();
    const order = {
      app_id: this.appId,
      app_trans_id: appTransId,
      app_user: appUser,
      app_time: appTime,
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embedData),
      amount: amount,
      description: description,
      mac: mac,
      callback_url: `${this.backendUrl}/zalopay/callback`,
      bank_code: 'zalopayapp',
    };
    try {
      const response = await axios.post(this.createEndpoint, null, {
        params: order,
      });
      if (response?.data && response.data.return_code === 1) {
        return { order_url: response.data.order_url };
      }
      throw new Error('No data received from ZaloPay API');
    } catch (error: any) {
      if (error.response?.data) throw error.response.data;
      throw error.message || error;
    }
  }

  async handleCallback(dataStr: string, reqMac: string) {
    const mac = CryptoJS.HmacSHA256(dataStr, this.key2).toString();
    if (mac !== reqMac) {
      return {
        return_code: -1,
        return_message: 'mac not equal',
      };
    }
    const dataJson = JSON.parse(dataStr);
    const app_trans_id = dataJson.app_trans_id;
    await this.ThanhToanRepository.updateStatus(app_trans_id, true);
    return {
      return_code: 1,
      return_message: 'success',
    };
  }

  async queryOrder(orderId: string) {
    let payment = await this.ThanhToanRepository.findByByOrderId(orderId);
    if (!payment) return null;
    const appTransId = payment.TT_id;
    const postData = {
      app_id: this.appId,
      app_trans_id: appTransId,
    };
    const data = `${postData.app_id}|${postData.app_trans_id}|${this.key1}`;
    postData['mac'] = CryptoJS.HmacSHA256(data, this.key1).toString();
    try {
      const response = await axios.post(
        this.queryEndpoint,
        qs.stringify(postData),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
      if (response?.data?.return_code === 1 && !payment.TT_daThanhToan) {
        payment = await this.ThanhToanRepository.updateStatus(appTransId, true);
      }
      return payment;
    } catch (error: any) {
      if (error.response?.data) throw error.response.data;
      throw error.message || error;
    }
  }
}
