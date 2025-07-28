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

  async countTokens(input: string): Promise<number> {
    if (!this.tokenizer) {
      throw new BadRequestException('Tokenizer chưa được khởi tạo');
    }
    const tokenIds: number[] = await this.tokenizer.encode(input);
    return tokenIds.length;
  }
}
