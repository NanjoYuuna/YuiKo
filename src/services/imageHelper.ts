import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

/**
 * 讀取圖片檔並根據正逆位決定是否旋轉 180 度。
 * 
 * @param filePath 圖片本地絕對路徑
 * @param isReversed 是否逆位
 * @returns 圖片 Buffer
 */
export async function getCardImageBuffer(filePath: string, isReversed: boolean): Promise<Buffer> {
  try {
    if (!isReversed) {
      return await fs.readFile(filePath);
    }
    return await sharp(filePath).rotate(180).toBuffer();
  } catch (error) {
    console.error(`[imageHelper] Error processing card image at ${filePath}:`, error);
    throw error;
  }
}
