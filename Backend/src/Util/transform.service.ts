/* eslint-disable @typescript-eslint/no-implied-eval */
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class TransformService implements OnModuleInit {
  private generateEmbeddings: any;

  async onModuleInit() {
    await this.initializePipeline();
  }

  private async initializePipeline() {
    try {
      const TransformersApi = Function(
        'return import("@xenova/transformers")'
      )();
      const { pipeline } = await TransformersApi;

      this.generateEmbeddings = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
    } catch (error) {
      console.error('Lỗi khi khởi tạo pipeline:', error);
      throw error;
    }
  }

  async getTextEmbedding(input: string): Promise<number[]> {
    const output = await this.generateEmbeddings(input, {
      pooling: 'mean',
      normalize: true,
    });

    if (output?.data && ArrayBuffer.isView(output.data)) {
      return Array.from(output.data);
    }

    throw new BadRequestException();
  }
}
