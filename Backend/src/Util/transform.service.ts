/* eslint-disable @typescript-eslint/no-implied-eval */
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class TransformService implements OnModuleInit {
  private generateEmbeddings: any;
  private tokenizer: any;

  async onModuleInit() {
    await this.initializePipeline();
  }

  private async initializePipeline() {
    try {
      const TransformersApi = Function(
        'return import("@xenova/transformers")'
      )();
      const { pipeline, AutoTokenizer } = await TransformersApi;

      this.generateEmbeddings = await pipeline(
        'feature-extraction',
        'Xenova/multilingual-e5-small'
      );
      this.tokenizer = await AutoTokenizer.from_pretrained(
        'Xenova/multilingual-e5-small'
      );
    } catch (error) {
      console.error('Lỗi khi khởi tạo pipeline:', error);
      throw error;
    }
  }

  /**
   * Tính embedding cho chuỗi văn bản đầu vào bằng mô hình E5.
   *
   * @param input - Chuỗi văn bản cần chuyển thành vector embedding.
   * @param type - Loại embedding cần tính: `'query'` (câu truy vấn) hoặc `'passage'` (đoạn văn).
   * @returns Vector embedding dưới dạng mảng số thực (float).
   */
  async getTextEmbedding(
    input: string,
    type: 'query' | 'passage' = 'query'
  ): Promise<number[]> {
    const formatted = `${type}: ${input}`;
    const output = await this.generateEmbeddings(formatted, {
      pooling: 'mean',
      normalize: true,
    });
    if (output?.data && ArrayBuffer.isView(output.data)) {
      return Array.from(output.data);
    }
    throw new BadRequestException();
  }

  /**
   * Đếm số lượng token trong chuỗi văn bản đầu vào.
   *
   * @param input - Chuỗi văn bản cần phân tích.
   * @returns Số lượng token sau khi mã hóa theo tokenizer của mô hình.
   */
  async countTokens(input: string): Promise<number> {
    if (!this.tokenizer) {
      throw new BadRequestException('Tokenizer chưa được khởi tạo');
    }
    const tokenIds: number[] = await this.tokenizer.encode(input);
    return tokenIds.length;
  }
}
