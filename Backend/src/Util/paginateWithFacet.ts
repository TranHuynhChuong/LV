import { Model } from 'mongoose';
import type { PipelineStage } from 'mongoose';

/**
 * Tính toán danh sách số trang dựa trên trang hiện tại, tổng số phần tử và giới hạn phần tử mỗi trang.
 *
 * @param page - Trang hiện tại (bắt đầu từ 1).
 * @param totalCount - Tổng số phần tử.
 * @param limit - Số phần tử trên mỗi trang.
 * @returns Mảng các số trang nên hiển thị (ví dụ: [1, 2, 3, 4, 5]).
 */
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

/**
 * Kết quả phân trang sau khi thực hiện aggregate.
 */
export interface PaginateResult<T> {
  data: T[];
  paginationInfo: {
    totalItems: number;
    totalPages: number;
    pageNumbers: number[];
  };
}

/**
 * Kết quả phân trang sau khi thực hiện aggregate.
 */
interface RawAggregatePaginateOptions {
  model: Model<any>;
  page?: number;
  limit: number;
  dataPipeline: PipelineStage[];
  countPipeline: PipelineStage[];
}

/**
 * Phân trang kết quả từ MongoDB aggregate pipeline (sử dụng thủ công).
 *
 * @param model - Mongoose model để gọi aggregate.
 * @param page - Trang hiện tại (mặc định là 1).
 * @param limit - Số phần tử mỗi trang.
 * @param dataPipeline - Pipeline để lấy dữ liệu trang hiện tại.
 * @param countPipeline - Pipeline để đếm tổng số phần tử.
 * @returns Kết quả phân trang bao gồm data và thông tin trang.
 */
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
