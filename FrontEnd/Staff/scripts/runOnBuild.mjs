import dotenv from 'dotenv';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';

// Hỗ trợ __dirname trong module ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load biến môi trường từ .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const apiUrl = process.env.NEXT_PUBLIC_API;

  if (!apiUrl) {
    throw new Error('Thiếu biến môi trường NEXT_PUBLIC_API trong .env');
  }

  const response = await fetch(`${apiUrl}/shipping/addressFiles`);
  const result = await response.json();

  const outputDir = path.resolve(__dirname, '../public/addresses');
  await mkdir(outputDir, { recursive: true });

  for (const item of result) {
    const { T_id, data } = item;
    const filePath = path.join(outputDir, `${T_id}.json`);
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  console.log('🎉 Hoàn tất tạo file JSON! address vào public/data');
}

main().catch((err) => {
  console.error('❌ Lỗi:', err);
});
