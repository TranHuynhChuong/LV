import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

export type SortType = Record<string, 1 | -1>;

export interface CursorPaginateOptions {
  cursorId: string;
  sort: SortType;
  sortField: string;
  limit: number;
  skip?: number;
  filter?: Record<string, any>;
  direction?: 'forward' | 'back';
  idField?: string;
  project?: Record<string, any>;
}

export class PaginateRepository<T extends { [key: string]: any }> {
  constructor(protected readonly model: Model<T>) {}

  async paginateCursor({
    cursorId,
    sort,
    sortField,
    limit,
    skip = 0,
    filter = {},
    direction = 'forward',
    idField,
    project,
  }: CursorPaginateOptions): Promise<any[]> {
    const cursorDoc = await this.model.findById(cursorId).lean();
    if (!cursorDoc)
      throw new NotFoundException('Không tìm thấy tài liệu cursor');

    const cursorVal = cursorDoc[sortField];
    const resolvedIdField = idField ?? '_id';
    const cursorIdVal = cursorDoc[resolvedIdField];

    const isAsc = sort[sortField] === 1;
    const cmpMain =
      direction === 'forward' ? (isAsc ? '$gt' : '$lt') : isAsc ? '$lt' : '$gt';
    const cmpTie = cmpMain;

    const match: any = { ...filter };
    match.$or = [
      { [sortField]: { [cmpMain]: cursorVal } },
      { [sortField]: cursorVal, [resolvedIdField]: { [cmpTie]: cursorIdVal } },
    ];

    const finalSort =
      direction === 'back'
        ? Object.fromEntries(
            Object.entries(sort).map(([k, v]) => [k, -v as 1 | -1])
          )
        : sort;

    const pipeline: any[] = [
      { $match: match },
      { $sort: finalSort },
      ...(skip ? [{ $skip: skip }] : []),
      { $limit: limit },
    ];

    if (project) {
      pipeline.push({ $project: project });
    }

    const docs = await this.model.aggregate(pipeline);
    return direction === 'back' ? docs.reverse() : docs;
  }
}
