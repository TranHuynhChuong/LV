import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TheLoaiDocument = TheLoai & Document;

@Schema()
export class LichSuThaoTacTL {
  /**
   * Mô tả thao tác
   */
  @Prop({ type: String })
  thaoTac: string;

  /**
   * Thời gian thao tác, mặc định là thời điểm tạo
   */
  @Prop({ type: Date, default: Date.now })
  thoiGian: Date;

  /**
   * ID nhân viên thực hiện thao tác
   */
  @Prop({
    type: String,
    required: true,
  })
  NV_id: string;
}

export const LichSuThaoTacTLSchema =
  SchemaFactory.createForClass(LichSuThaoTacTL);

@Schema()
export class TheLoai {
  /**
   * ID thể loại, duy nhất
   */
  @Prop({ type: Number, unique: true })
  TL_id: number;

  /**
   * Tên thể loại, bắt buộc, độ dài 2-48 ký tự
   */
  @Prop({ type: String, required: true, minlength: 2, maxlength: 48 })
  TL_ten: string;

  /**
   * ID thể loại cha (nếu có), cho phép null
   */
  @Prop({ type: Number, default: null })
  TL_idTL: number;

  /**
   * Cờ đánh dấu thể loại đã bị xóa (mềm)
   */
  @Prop({ type: Boolean, default: false })
  TL_daXoa: boolean;

  /**
   * Mảng lịch sử thao tác trên thể loại
   */
  @Prop({ type: [LichSuThaoTacTLSchema] })
  lichSuThaoTac: LichSuThaoTacTL[];
}

export const TheLoaiSchema = SchemaFactory.createForClass(TheLoai);
