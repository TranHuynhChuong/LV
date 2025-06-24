import { Model } from 'mongoose';
import type { PipelineStage } from 'mongoose';

export function calculatePaginate(
  page: number,
  totalCount: number,
  limit: number
): number[] {
  const totalPage = Math.ceil(totalCount / limit);
  const range = 2; // số trang trước và sau trang hiện tại

  let start = page - range;
  let end = page + range;

  // Điều chỉnh start và end không vượt quá biên
  if (start < 1) {
    start = 1;
    end = Math.min(5, totalPage);
  } else if (end > totalPage) {
    end = totalPage;
    start = Math.max(totalPage - 4, 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}

export interface PaginateResult<T> {
  data: T[];
  paginationInfo: {
    totalItems: number;
    totalPages: number;
    pageNumbers: number[];
  };
}

interface RawAggregatePaginateOptions {
  model: Model<any>;
  page?: number;
  limit: number;
  dataPipeline: PipelineStage[];
  countPipeline: PipelineStage[];
}

export async function paginateRawAggregate<T>({
  model,
  page = 1,
  limit,
  dataPipeline,
  countPipeline,
}: RawAggregatePaginateOptions): Promise<PaginateResult<T>> {
  const [data, countResult] = await Promise.all([
    model.aggregate(dataPipeline),
    model.aggregate(countPipeline),
  ]);

  const totalItems = countResult?.[0]?.count ?? 0;
  const totalPages = Math.ceil(totalItems / limit);
  const pageNumbers = calculatePaginate(page, totalItems, limit);

  return {
    data,
    paginationInfo: {
      totalItems,
      totalPages,
      pageNumbers,
    },
  };
}
