import { Db, ClientSession, Document } from 'mongodb';

/**
 * Lấy số thứ tự tiếp theo từ collection 'counters'
 * @param db Kết nối MongoDB
 * @param name Tên bộ đếm (vd: 'order', 'invoice')
 * @param session Phiên giao dịch MongoDB nếu có
 * @returns Giá trị số mới nhất sau khi tăng
 */
export async function getNextSequence(
  db: Db,
  name: string,
  session?: ClientSession
): Promise<number> {
  const result = await db.collection('counters').findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: 'after',
      session,
    }
  );

  if (!result) {
    throw new Error(`Không lấy được sequence cho counter: ${name}`);
  }
  return result.seq as number;
}
