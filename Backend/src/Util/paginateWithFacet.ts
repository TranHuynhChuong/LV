import { Model } from 'mongoose';

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
  metadata: {
    totalItems: number;
    totalPage: number;
    paginations: number[];
    page: number;
  };
}

interface FacetPaginateOptions {
  model: Model<any>;
  page?: number;
  limit: number;
  search?: Record<string, any>;
  filter?: Record<string, any>;
  sort?: Record<string, number>;
  project?: Record<string, any>;
}

/**
 * Build aggregation pipeline with $facet stage for pagination.
 */
import type { PipelineStage } from 'mongoose';

function buildFacetPaginationPipeline({
  search,
  filter = {},
  sort = { _id: -1 },
  skip,
  limit,
  project,
}: {
  search?: Record<string, any>;
  filter?: Record<string, any>;
  sort: Record<string, any>;
  skip: number;
  limit: number;
  project?: Record<string, any>;
}): PipelineStage[] {
  const pipeline: PipelineStage[] = [];

  // $search stage (MongoDB Atlas full text search)
  if (search && Object.keys(search).length > 0) {
    pipeline.push({ $search: search });
  }

  // $match stage for filter
  pipeline.push({ $match: filter });

  // $facet stage
  const facetStage: Record<string, any> = {
    data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
    totalCount: [{ $count: 'count' }],
  };

  if (project && Object.keys(project).length > 0) {
    facetStage.data.push({ $project: project });
  }

  pipeline.push({ $facet: facetStage });

  return pipeline;
}

/**
 * Paginate using aggregation with $facet.
 */
export async function paginateWithFacet<T>({
  model,
  page = 1,
  limit,
  search,
  filter = {},
  sort = { _id: -1 },
  project,
}: FacetPaginateOptions): Promise<PaginateResult<T>> {
  const skip = (page - 1) * limit;
  const pipeline = buildFacetPaginationPipeline({
    search,
    filter,
    sort,
    skip,
    limit,
    project,
  });

  const result = await model.aggregate(pipeline);

  const totalItems = result[0]?.totalCount?.[0]?.count ?? 0;
  const data = result[0]?.data ?? [];

  const totalPage = Math.ceil(totalItems / limit);
  const paginations = calculatePaginate(page, totalItems, limit);

  return {
    data,
    metadata: {
      totalItems,
      totalPage,
      paginations,
      page,
    },
  };
}
