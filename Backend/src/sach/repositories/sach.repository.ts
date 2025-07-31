import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sach, SachDocument, BookStatus } from '../schemas/sach.schema';
import {
  paginateRawAggregate,
  PaginateResult,
} from 'src/Util/paginateWithFacet';
import type { ClientSession, PipelineStage } from 'mongoose';
export type BookListResults = PaginateResult<SachDocument>;

/**
 * Các loại bộ lọc cho sách, dùng để phân loại trạng thái hiển thị và tồn kho.
 */
export enum BookFilterType {
  /** Hiển thị tất cả sách đang hiển thị (Show = Hiện) */
  ShowAll = 'show-all',

  /** Hiển thị sách đang hiển thị và còn trong kho */
  ShowInStock = 'show-in-stock',

  /** Hiển thị sách đang hiển thị nhưng đã hết hàng */
  ShowOutOfStock = 'show-out-of-stock',

  /** Hiển thị tất cả sách đang ẩn (Hidden = Ẩn) */
  HiddenAll = 'hidden-all',

  /** Hiển thị sách đang ẩn và còn trong kho */
  HiddenInStock = 'hidden-in-stock',

  /** Hiển thị sách đang ẩn nhưng đã hết hàng */
  HiddenOutOfStock = 'hidden-out-of-stock',

  /** Hiển thị tất cả sách bất kể trạng thái (Hiện/Ẩn) */
  AllAll = 'all-all',

  /** Hiển thị tất cả sách còn trong kho bất kể trạng thái */
  AllInStock = 'all-in-stock',

  /** Hiển thị tất cả sách đã hết hàng bất kể trạng thái */
  AllOutOfStock = 'all-out-of-stock',

  /** Loại trừ sách đang áp dụng khuyến mãi (Active Promotion) */
  ExcludeActivePromotion = 'excludeActivePromotion',
}

/**
 * Các kiểu sắp xếp sách trong danh sách.
 */
export enum BookSortType {
  /** Sắp xếp theo sách mới nhất (theo ngày hoặc mã sách giảm dần) */
  Latest = 'latest',

  /** Sắp xếp theo sách bán chạy nhất (số lượng đã bán giảm dần) */
  BestSelling = 'best-selling',

  /** Sắp xếp theo sách được đánh giá nhiều nhất (điểm đánh giá giảm dần) */
  MostRating = 'most-rating',

  /** Sắp xếp theo giá tăng dần */
  PriceAsc = 'price-asc',

  /** Sắp xếp theo giá giảm dần */
  PriceDesc = 'price-desc',
}

@Injectable()
export class SachRepository {
  constructor(
    @InjectModel(Sach.name)
    private readonly SachModel: Model<SachDocument>
  ) {}

  /**
   * Tạo mới một bản ghi sách trong cơ sở dữ liệu.
   *
   * @param data Dữ liệu một phần của sách cần tạo
   * @param session (Tuỳ chọn) Phiên làm việc của MongoDB để hỗ trợ transaction
   * @returns Promise trả về đối tượng sách vừa được tạo
   */
  async create(data: Partial<Sach>, session?: ClientSession): Promise<Sach> {
    const created = await this.SachModel.create(
      [data],
      session ? { session } : {}
    );
    return created[0];
  }

  /**
   * Cập nhật số lượng đã bán và tồn kho của nhiều sách đồng thời.
   *
   * @param updates Mảng đối tượng chứa id sách và số lượng đã bán tương ứng
   * @param session (Tuỳ chọn) Phiên làm việc của MongoDB để hỗ trợ transaction
   * @returns Kết quả của thao tác bulkWrite từ Mongoose
   */
  async updateSold(
    updates: { id: number; sold: number }[],
    session?: ClientSession
  ) {
    const operations = updates.map(({ id, sold }) => ({
      updateOne: {
        filter: { S_id: id },
        update: {
          $inc: {
            S_tonKho: -sold,
            S_daBan: sold,
          },
        },
      },
    }));
    const result = await this.SachModel.bulkWrite(operations, { session });
    return result;
  }

  /**
   * Cập nhật điểm đánh giá của một sách theo ID.
   *
   * @param id ID sách cần cập nhật điểm
   * @param score Điểm đánh giá mới
   * @param session (Tuỳ chọn) Phiên làm việc MongoDB hỗ trợ transaction
   * @returns Kết quả của thao tác updateOne từ Mongoose
   */
  async updateScore(id: number, score: number, session?: ClientSession) {
    return this.SachModel.updateOne(
      { S_id: id },
      {
        $set: { S_diemDG: score },
      },
      { session }
    );
  }

  /**
   * Cập nhật thông tin sách theo ID, chỉ cập nhật những sách chưa bị xoá mềm.
   *
   * @param id ID sách cần cập nhật
   * @param data Dữ liệu cần cập nhật (có thể là một phần của đối tượng Sach)
   * @param session (Tuỳ chọn) Phiên làm việc MongoDB hỗ trợ transaction
   * @returns Đối tượng sách đã được cập nhật hoặc null nếu không tìm thấy
   */
  async update(
    id: number,
    data: Partial<Sach>,
    session?: ClientSession
  ): Promise<Sach | null> {
    return this.SachModel.findOneAndUpdate(
      { S_id: id, S_trangThai: { $ne: BookStatus.Deleted } },
      { $set: data },
      {
        new: true,
        session,
      }
    ).lean();
  }

  /**
   * Xóa sách theo ID khỏi cơ sở dữ liệu (xóa cứng).
   *
   * @param id ID của sách cần xóa
   * @returns Đối tượng sách vừa bị xóa hoặc null nếu không tìm thấy
   */
  async remove(id: number): Promise<Sach | null> {
    return this.SachModel.findOneAndDelete({ S_id: id }).lean();
  }

  /**
   * Xây dựng các pipeline cho truy vấn phân trang, lọc, sắp xếp sách.
   *
   * @param params Tham số truy vấn bao gồm:
   * - page: Trang cần lấy
   * - limit: Số bản ghi mỗi trang (mặc định 24)
   * - sortType: Kiểu sắp xếp (tuỳ chọn)
   * - filterType: Kiểu lọc sách (tuỳ chọn)
   * - categoryIds: Danh sách ID thể loại (tuỳ chọn)
   * - keyword: Từ khóa tìm kiếm (tuỳ chọn)
   * @returns Đối tượng gồm hai pipeline:
   * - dataPipeline: pipeline lấy dữ liệu sách theo điều kiện, phân trang, sắp xếp, lọc,...
   * - countPipeline: pipeline tính tổng số bản ghi phù hợp với điều kiện lọc
   */
  protected buildSplitPipelines({
    page,
    limit = 24,
    sortType,
    filterType,
    categoryIds,
    keyword,
  }: {
    page: number;
    limit?: number;
    sortType?: BookSortType;
    filterType?: BookFilterType;
    categoryIds?: number[];
    keyword?: string;
  }): { dataPipeline: PipelineStage[]; countPipeline: PipelineStage[] } {
    const ExcludeUnexpiredPromotion =
      filterType === BookFilterType.ExcludeActivePromotion;
    const search = this.getSearch(keyword);
    const filter = this.getFilter(filterType, categoryIds);
    const sort = this.getSort(sortType);
    const skip = (page - 1) * limit;
    const project = this.getProject();
    const needDiscountEarly =
      sortType === BookSortType.PriceAsc || sortType === BookSortType.PriceDesc;
    const preStages: PipelineStage[] = [];
    if (search) preStages.push({ $search: search });
    preStages.push({ $match: filter });
    const dataPipeline: PipelineStage[] = [...preStages];
    if (ExcludeUnexpiredPromotion) {
      dataPipeline.push(...this.buildExcludeUnexpiredPromotionStage());
    } else if (needDiscountEarly) {
      dataPipeline.push(...this.buildPromotionStages());
    }
    if (sort && Object.keys(sort).length > 0) {
      dataPipeline.push({ $sort: sort });
    }
    const countPipeline: PipelineStage[] = [...preStages];
    if (ExcludeUnexpiredPromotion) {
      countPipeline.push(...this.buildExcludeUnexpiredPromotionStage());
    }
    countPipeline.push(...this.buildPromotionStages(), { $count: 'count' });
    dataPipeline.push({ $skip: skip }, { $limit: limit });
    if (!ExcludeUnexpiredPromotion && !needDiscountEarly) {
      dataPipeline.push(...this.buildPromotionStages());
    }
    dataPipeline.push({ $project: project });
    return { dataPipeline, countPipeline };
  }

  protected buildPromotionStages(): PipelineStage[] {
    const now = new Date();
    const stages: PipelineStage[] = [
      {
        $lookup: {
          from: 'chitietkhuyenmais',
          let: { s_id: '$S_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$S_id', '$$s_id'] },
                    { $eq: ['$CTKM_daXoa', false] },
                    { $eq: ['$CTKM_tamNgung', false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'khuyenmais',
                let: { km_id: '$KM_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$KM_id', '$$km_id'] },
                          { $lte: ['$KM_batDau', now] },
                          { $gte: ['$KM_ketThuc', now] },
                        ],
                      },
                    },
                  },
                ],
                as: 'km',
              },
            },
            {
              $match: {
                $expr: { $gt: [{ $size: '$km' }, 0] }, // Chỉ giữ CTKM có KM hiệu lực
              },
            },
          ],
          as: 'khuyenMai',
        },
      },
    ];
    stages.push({
      $addFields: {
        S_giaGiam: {
          $cond: {
            if: { $gt: [{ $size: '$khuyenMai' }, 0] },
            then: {
              $min: {
                $map: {
                  input: '$khuyenMai',
                  as: 'ctkm',
                  in: '$$ctkm.CTKM_giaSauGiam',
                },
              },
            },
            else: '$S_giaBan',
          },
        },
      },
    });
    return stages;
  }

  /**
   * Xây dựng các stage cho pipeline MongoDB để lấy thông tin khuyến mãi áp dụng cho sách.
   *
   * @returns Mảng các PipelineStage phục vụ cho aggregation trong MongoDB.
   */
  protected buildExcludeUnexpiredPromotionStage(): PipelineStage[] {
    const now = new Date();
    return [
      {
        $lookup: {
          from: 'chitietkhuyenmais',
          let: { s_id: '$S_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$S_id', '$$s_id'] },
                    { $eq: ['$CTKM_daXoa', false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'khuyenmais',
                let: { km_id: '$KM_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$KM_id', '$$km_id'] },
                          { $gte: ['$KM_ketThuc', now] }, // Chưa kết thúc
                        ],
                      },
                    },
                  },
                ],
                as: 'km',
              },
            },
            {
              $match: {
                $expr: {
                  $gt: [{ $size: '$km' }, 0], // Có KM chưa kết thúc
                },
              },
            },
          ],
          as: 'unexpiredPromotions',
        },
      },
      {
        $match: {
          $expr: {
            $eq: [{ $size: '$unexpiredPromotions' }, 0], // Không có khuyến mãi chưa kết thúc
          },
        },
      },
    ];
  }

  /**
   * Lấy cấu trúc sắp xếp (sort) cho truy vấn MongoDB dựa trên loại sắp xếp được chọn.
   *
   * @param sortType Kiểu sắp xếp sách (BookSortType)
   * @returns Đối tượng chứa các trường và hướng sắp xếp, hoặc undefined nếu không xác định
   */
  protected getSort(sortType?: BookSortType): Record<string, any> | undefined {
    switch (sortType) {
      case BookSortType.Latest:
        return { S_id: -1 }; // mới nhất
      case BookSortType.BestSelling:
        return { S_daBan: -1, S_id: -1 }; // doanh số
      case BookSortType.MostRating:
        return { S_diemDG: -1, S_id: -1 }; // điểm đánh giá giảm
      case BookSortType.PriceAsc:
        return { S_giaGiam: 1, S_id: -1 }; // giá tăng
      case BookSortType.PriceDesc:
        return { S_giaGiam: -1, S_id: -1 }; // giá giảm
      default:
        return undefined;
    }
  }

  /**
   * Tạo bộ lọc (filter) cho truy vấn sách dựa trên loại lọc và danh sách thể loại.
   *
   * @param filterType Kiểu lọc sách (BookFilterType), mặc định là lọc tất cả (AllAll)
   * @param categoryIds Mảng ID thể loại để lọc (nếu có)
   * @returns Đối tượng filter MongoDB dùng trong truy vấn
   */
  protected getFilter(
    filterType: BookFilterType = BookFilterType.AllAll,
    categoryIds?: number[]
  ): Record<string, any> {
    const filter: Record<string, any> = {};
    // Trạng thái
    if (filterType.startsWith('show')) {
      filter.S_trangThai = BookStatus.Show;
    } else if (filterType.startsWith('hidden')) {
      filter.S_trangThai = BookStatus.Hidden;
    } else if (filterType.startsWith('all')) {
      filter.S_trangThai = { $in: [BookStatus.Show, BookStatus.Hidden] };
    }
    // Tồn kho
    if (filterType.endsWith('in-stock')) {
      filter.S_tonKho = { $gt: 0 };
    } else if (filterType.endsWith('out-of-stock')) {
      filter.S_tonKho = 0;
    }
    if (filterType === BookFilterType.ExcludeActivePromotion) {
      filter.S_trangThai = BookStatus.Show;
    }
    // Thể loại
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      filter.TL_id = { $in: categoryIds };
    }
    return filter;
  }

  /**
   * Tạo cấu trúc tìm kiếm full-text sử dụng MongoDB Atlas Search.
   *
   * @param keyword Từ khóa tìm kiếm (chuỗi)
   * @returns Đối tượng cấu hình pipeline $search hoặc undefined nếu không có từ khóa
   */
  protected getSearch(keyword?: string) {
    if (!keyword || keyword === '') return undefined;
    return {
      index: 'default',
      text: {
        query: keyword,
        path: ['S_ten', 'S_tacGia', 'S_nhaXuatBan'],
        fuzzy: {
          maxEdits: 1,
          prefixLength: 2,
        },
      },
    };
  }

  /**
   * Xây dựng đối tượng projection cho pipeline Aggregation,
   * chỉ chọn ra các trường cần thiết khi truy vấn sách,
   * bao gồm ảnh bìa đầu tiên (nếu có).
   *
   * @returns Đối tượng projection cho MongoDB Aggregation Pipeline
   */
  protected getProject() {
    return {
      S_id: 1,
      S_isbn: 1,
      S_diemDG: 1,
      S_ten: 1,
      S_tacGia: 1,
      S_nhaXuatBan: 1,
      S_giaBan: 1,
      S_giaGiam: 1,
      S_tonKho: 1,
      S_daBan: 1,
      S_giaNhap: 1,
      S_trangThai: 1,
      S_trongLuong: 1,
      TL_id: 1,
      S_anh: {
        $arrayElemAt: [
          {
            $map: {
              input: {
                $filter: {
                  input: '$S_anh',
                  as: 'anh',
                  cond: { $eq: ['$$anh.A_anhBia', true] },
                },
              },
              as: 'anh',
              in: '$$anh.A_url',
            },
          },
          0,
        ],
      },
    };
  }

  /**
   * Tìm tất cả sách theo phân trang, lọc và sắp xếp tùy chọn.
   *
   * @param page - Trang cần lấy
   * @param sortType - Loại sắp xếp sách (mới nhất, bán chạy, đánh giá, giá)
   * @param filterType - Loại lọc sách (trạng thái, tồn kho, khuyến mãi, ...)
   * @param limit - Số bản ghi tối đa mỗi trang, mặc định 24
   * @returns Kết quả phân trang gồm danh sách sách và tổng số bản ghi
   */
  async findAll(
    page: number,
    sortType?: BookSortType,
    filterType?: BookFilterType,
    limit = 24
  ): Promise<BookListResults> {
    const { dataPipeline, countPipeline } = this.buildSplitPipelines({
      page,
      limit,
      sortType,
      filterType,
    });
    return paginateRawAggregate({
      model: this.SachModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  /**
   * Tìm kiếm sách theo từ khóa, phân trang, lọc và sắp xếp tùy chọn.
   *
   * @param page - Trang cần lấy
   * @param sortType - Loại sắp xếp sách (mới nhất, bán chạy, đánh giá, giá)
   * @param filterType - Loại lọc sách (trạng thái, tồn kho, khuyến mãi, ...)
   * @param limit - Số bản ghi tối đa mỗi trang, mặc định 24
   * @param keyword - Từ khóa tìm kiếm (tên sách, tác giả, nhà xuất bản)
   * @param categoryIds - Danh sách ID thể loại để lọc sách
   * @returns Kết quả phân trang gồm danh sách sách thỏa mãn tìm kiếm và tổng số bản ghi
   */
  async search(
    page: number,
    sortType?: BookSortType,
    filterType?: BookFilterType,
    limit = 24,
    keyword?: string,
    categoryIds?: number[]
  ): Promise<BookListResults> {
    const { dataPipeline, countPipeline } = this.buildSplitPipelines({
      page,
      limit,
      sortType,
      filterType,
      categoryIds,
      keyword,
    });
    return paginateRawAggregate({
      model: this.SachModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  /**
   * Lấy danh sách sách đang hiển thị (Show) theo danh sách ID truyền vào.
   *
   * @param ids - Mảng các ID sách cần tìm
   * @returns Mảng đối tượng sách (Sach) đang ở trạng thái Show và thuộc các ID đã cho
   */
  async findAllShowByIds(ids: number[]): Promise<Sach[]> {
    const project = this.getProject();
    const filter = this.getFilter(BookFilterType.ShowAll);
    const discountLookupStage = this.buildPromotionStages();
    return this.SachModel.aggregate([
      {
        $match: {
          S_id: { $in: ids },
          ...filter,
        },
      },
      ...discountLookupStage,
      { $project: project },
    ]).exec() as Promise<Sach[]>;
  }

  async findLastId(session?: ClientSession): Promise<number> {
    const result = await this.SachModel.findOne()
      .sort({ S_id: -1 })
      .session(session ?? null)
      .lean();

    return result?.S_id ?? 0;
  }

  /**
   * Tìm sách theo mã ISBN với tùy chọn lọc trạng thái sách.
   *
   * @param id - Mã ISBN của sách cần tìm
   * @param filterType - Kiểu lọc trạng thái sách (mặc định có thể không truyền)
   * @returns Đối tượng sách đầu tiên tìm được hoặc null nếu không có
   */
  async findByIsbn(id: string, filterType?: BookFilterType): Promise<any> {
    const discountStages = this.buildPromotionStages();
    const searchFilter = {
      S_isbn: id,
      ...this.getFilter(filterType),
    };
    const project = this.getProject();
    return this.SachModel.aggregate([
      { $match: searchFilter },
      ...discountStages,
      { $project: project },
    ]).then((result: Sach[]) => result[0] ?? null);
  }

  /**
   * Tìm sách theo ID với hai chế độ lấy dữ liệu:
   * - 'default': lấy thông tin cơ bản, loại bỏ sách đã xóa và trường tóm tắt mở rộng.
   * - 'full': lấy đầy đủ thông tin, bao gồm cả thể loại và tính khuyến mãi.
   *
   * @param id - ID của sách cần tìm
   * @param mode - Chế độ lấy dữ liệu: 'default' hoặc 'full' (mặc định là 'default')
   * @returns Đối tượng sách hoặc null nếu không tìm thấy
   */
  async findById(
    id: number,
    mode: 'default' | 'full' = 'default'
  ): Promise<any> {
    const discountStages = this.buildPromotionStages();
    if (mode === 'full') {
      const filter = this.getFilter(BookFilterType.ShowAll);
      return this.SachModel.aggregate([
        {
          $match: {
            S_id: id,
            ...filter,
          },
        },
        {
          $lookup: {
            from: 'theloais',
            localField: 'TL_id',
            foreignField: 'TL_id',
            as: 'S_TL_info',
          },
        },
        {
          $addFields: {
            S_TL: {
              $map: {
                input: '$S_TL_info',
                as: 'tl',
                in: {
                  TL_id: '$$tl.TL_id',
                  TL_ten: '$$tl.TL_ten',
                },
              },
            },
          },
        },
        ...discountStages,
        {
          $project: {
            lichSuThaoTac: 0,
            S_TL_info: 0,
            khuyenMai: 0,
          },
        },
      ]).then((result: Sach[]) => result[0] ?? null);
    }
    // mode === 'default'
    return this.SachModel.findOne({
      S_id: id,
      S_trangThai: { $ne: BookStatus.Deleted },
    })
      .select('-S_eTomTat')
      .lean()
      .exec();
  }

  /**
   * Tìm kiếm gợi ý autocomplete dựa trên từ khóa nhập vào,
   * ưu tiên tìm kiếm trên các trường: tên sách, tác giả, nhà xuất bản.
   * Kết quả trả về là danh sách chuỗi gợi ý có độ dài tối đa limit.
   *
   * @param keyword - Từ khóa tìm kiếm autocomplete
   * @param limit - Số lượng kết quả tối đa trả về (mặc định 10)
   * @returns Mảng chuỗi gợi ý autocomplete
   */
  async searchAutocomplete(keyword: string, limit = 10): Promise<string[]> {
    const pipelineForField = (field: string, priority: number) => [
      {
        $search: {
          index: 'default',
          autocomplete: {
            query: keyword,
            path: field,
          },
        },
      },
      {
        $project: {
          suggestion: `$${field}`,
          _id: 0,
          priority: { $literal: priority },
        },
      },
      {
        $match: {
          suggestion: {
            $ne: null,
            $regex: keyword,
            $options: 'i',
          },
        },
      },
    ];
    const result: { suggestion: string }[] = await this.SachModel.aggregate([
      ...pipelineForField('S_ten', 1),
      {
        $unionWith: {
          coll: 'saches',
          pipeline: pipelineForField('S_tacGia', 2),
        },
      },
      {
        $unionWith: {
          coll: 'saches',
          pipeline: pipelineForField('S_nhaXuatBan', 3),
        },
      },
      {
        $group: {
          _id: '$suggestion',
          priority: { $min: '$priority' },
        },
      },
      {
        $sort: { priority: 1 },
      },
      {
        $replaceWith: { suggestion: '$_id' },
      },
      {
        $limit: limit,
      },
    ]);
    return result.map((item) => item.suggestion);
  }

  /**
   * Tìm sách dựa trên truy vấn vector embedding (tương tự tìm kiếm theo ngữ nghĩa).
   * Sử dụng MongoDB $vectorSearch để tìm kiếm các sách có vector gần nhất với queryVector.
   * Kết quả trả về là danh sách sách cùng điểm số vector (vectorScore), đã lọc theo trạng thái hiển thị.
   *
   * @param queryVector - Vector truy vấn (mảng số) để so sánh với vector tóm tắt sách
   * @param limit - Số lượng sách tối đa trả về (mặc định 5)
   * @param minScore - Ngưỡng điểm số vector tối thiểu để lọc kết quả (mặc định 0)
   * @returns Mảng các sách phù hợp kèm điểm số vectorScore
   */
  async findByVector(
    queryVector: number[],
    limit = 5,
    minScore = 0
  ): Promise<any[]> {
    const project = this.getProject();
    const discountStages = this.buildPromotionStages();
    return this.SachModel.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'S_eTomTat',
          queryVector,
          numCandidates: 50,
          limit,
        },
      },
      {
        $match: {
          S_trangThai: BookStatus.Show,
        },
      },
      {
        $addFields: {
          vectorScore: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $match: {
          vectorScore: { $gte: minScore },
        },
      },
      {
        $sort: { vectorScore: -1 },
      },
      {
        $lookup: {
          from: 'theloais',
          localField: 'TL_id',
          foreignField: 'TL_id',
          as: 'S_TL_info',
        },
      },
      {
        $addFields: {
          S_TL: {
            $map: {
              input: '$S_TL_info',
              as: 'tl',
              in: '$$tl.TL_ten',
            },
          },
        },
      },
      ...discountStages,
      {
        $project: {
          ...project,
          S_TL: 1,
          score: '$vectorScore',
        },
      },
    ]).exec();
  }

  /**
   * Đếm tổng số sách theo trạng thái hiển thị và tình trạng tồn kho.
   * Trả về đối tượng chứa thông tin số lượng sách đang hiển thị (live) và ẩn (hidden),
   * mỗi loại phân chia thành tổng số, số sách còn hàng (in stock) và hết hàng (out of stock).
   *
   * @returns Promise<{ live: { total: number; in: number; out: number }; hidden: { total: number; in: number; out: number } }>
   */
  async countAll(): Promise<{
    live: { total: number; in: number; out: number };
    hidden: { total: number; in: number; out: number };
  }> {
    const [liveTotal, liveIn, liveOut, hiddenTotal, hiddenIn, hiddenOut] =
      await Promise.all([
        this.SachModel.countDocuments({ S_trangThai: BookStatus.Show }),
        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Show,
          S_tonKho: { $gt: 0 },
        }),
        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Show,
          S_tonKho: 0,
        }),
        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Hidden,
        }),
        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Hidden,
          S_tonKho: { $gt: 0 },
        }),
        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Hidden,
          S_tonKho: 0,
        }),
      ]);
    return {
      live: { total: liveTotal, in: liveIn, out: liveOut },
      hidden: { total: hiddenTotal, in: hiddenIn, out: hiddenOut },
    };
  }

  /**
   * Đếm số lượng sách theo trạng thái lọc.
   * Nếu filterType là 'Show' thì đếm sách đang hiển thị,
   * nếu là 'Hidden' thì đếm sách đang ẩn,
   * nếu là 'all' hoặc không truyền thì đếm cả sách hiển thị và ẩn.
   *
   * @param filterType Trạng thái lọc: BookStatus.Show | BookStatus.Hidden | 'all' (mặc định là 'all')
   * @returns Promise<number> Tổng số sách thỏa mãn điều kiện lọc
   */
  async count(filterType?: BookStatus | 'all'): Promise<number> {
    const filter: any = {};
    if (filterType === BookStatus.Show) {
      filter.S_trangThai = BookStatus.Show;
    } else if (filterType === BookStatus.Hidden) {
      filter.S_trangThai = BookStatus.Hidden;
    } else {
      filter.S_trangThai = { $in: [BookStatus.Show, BookStatus.Hidden] };
    }
    return this.SachModel.countDocuments(filter);
  }

  /**
   * Tìm tất cả sách thuộc các thể loại có trong danh sách `ids`.
   *
   * @param ids Mảng ID thể loại cần tìm sách
   * @returns Promise<Sach[]> Danh sách sách thuộc các thể loại đã cho
   */
  async findInCategories(ids: number[]) {
    return this.SachModel.find({
      TL_id: { $in: ids },
    });
  }
}
