import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

export type SortType = Record<string, 1 | -1>;

export interface CursorPaginateOptions {
  mode?: 'head' | 'cursor' | 'tail';
  cursorId?: string;
  sort?: SortType;
  sortField?: string;
  limit: number;
  skip?: number;
  filter?: Record<string, any>;
  direction?: 'forward' | 'back';
  idField?: string;
  project?: Record<string, any>;
  search?: Record<string, any>;
}
export function calculatePaginate(
  currentPage: number,
  totalCount: number,
  limit: number
): number[] {
  const totalPage = Math.ceil(totalCount / limit);
  const range = 2; // số trang trước và sau trang hiện tại

  let start = currentPage - range;
  let end = currentPage + range;

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

export class PaginateRepository<T extends { [key: string]: any }> {
  constructor(protected readonly model: Model<T>) {}

  async paginateCursor({
    mode = 'cursor',
    cursorId,
    sort = { _id: -1 },
    sortField = '_id',
    limit,
    skip = 0,
    filter = {},
    direction = 'forward',
    idField = '_id',
    project,
    search,
  }: CursorPaginateOptions): Promise<any[]> {
    const finalProject = project ?? {};
    const finalSearch = search ?? {};
    switch (mode) {
      case 'head':
        return this.paginateHead({
          sort,
          limit,
          skip,
          filter: filter ?? {},
          project: finalProject,
          search: finalSearch,
        });
      case 'tail':
        return this.paginateTail({
          sort,
          limit,
          skip,
          filter: filter ?? {},
          project: finalProject,
          search: finalSearch,
        });
      default:
        return this.paginateWithCursor({
          cursorId,
          sort,
          sortField,
          limit,
          skip,
          filter,
          direction,
          idField,
          project: finalProject,
          search,
        });
    }
  }

  private async paginateHead({
    sort,
    limit,
    skip = 0,
    filter = {},
    project,
    search,
  }: Required<
    Pick<
      CursorPaginateOptions,
      'sort' | 'limit' | 'skip' | 'filter' | 'project' | 'search'
    >
  >): Promise<any[]> {
    const pipeline = this.buildPipeline({
      sort,
      limit,
      skip,
      filter,
      project,
      search,
    });
    return await this.model.aggregate(pipeline);
  }

  private async paginateTail({
    sort,
    limit,
    skip = 0,
    filter = {},
    project,
    search,
  }: Required<
    Pick<
      CursorPaginateOptions,
      'sort' | 'limit' | 'skip' | 'filter' | 'project' | 'search'
    >
  >): Promise<any[]> {
    const reverseSort = this.reverseSort(sort);
    const pipeline = this.buildPipeline({
      sort: reverseSort,
      limit,
      skip,
      filter,
      project,
      search,
    });
    const docs = await this.model.aggregate(pipeline);
    return docs.reverse();
  }

  private async paginateWithCursor({
    cursorId,
    sort,
    sortField,
    limit,
    skip = 0,
    filter = {},
    direction = 'forward',
    idField = '_id',
    project,
    search,
  }: CursorPaginateOptions): Promise<any[]> {
    if (!cursorId) throw new BadRequestException('Missing cursorId');
    if (!sortField) throw new BadRequestException('Missing sortField');

    const cursorDoc = await this.model.findById(cursorId).lean();
    if (!cursorDoc) throw new BadRequestException('Invalid cursorId');

    const cursorVal = cursorDoc[sortField];
    const cursorIdVal = cursorDoc[idField];

    const safeSort = sort || { _id: -1 };
    const isAsc = safeSort[sortField] === 1;
    const cmp =
      direction === 'forward' ? (isAsc ? '$gt' : '$lt') : isAsc ? '$lt' : '$gt';

    const match: any = {
      ...filter,
      $or: [
        { [sortField]: { [cmp]: cursorVal } },
        {
          [sortField]: cursorVal,
          [idField]: { [cmp]: cursorIdVal },
        },
      ],
    };

    const finalSort =
      direction === 'back'
        ? this.reverseSort(sort || { _id: -1 })
        : sort || { _id: -1 };

    const pipeline = this.buildPipeline({
      sort: finalSort,
      limit,
      skip,
      filter: match,
      project,
      search,
    });
    const docs = await this.model.aggregate(pipeline);
    return direction === 'back' ? docs.reverse() : docs;
  }

  private buildPipeline({
    sort,
    limit,
    skip,
    filter,
    project,
    search,
  }: {
    sort: SortType;
    limit: number;
    skip?: number;
    filter: Record<string, any>;
    project?: Record<string, any>;
    search?: Record<string, any>;
  }): any[] {
    const pipeline: any[] = [];

    if (search && Object.keys(search).length > 0)
      pipeline.push({ $search: search });
    pipeline.push({ $match: filter });
    pipeline.push({ $sort: sort });
    if (skip) pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    if (project && Object.keys(project).length > 0)
      pipeline.push({ $project: project });

    return pipeline;
  }

  private reverseSort(sort: SortType): SortType {
    return Object.fromEntries(
      Object.entries(sort).map(([k, v]) => [k, -v as 1 | -1])
    );
  }
}
