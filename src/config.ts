import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ 缺少必要的環境變數：${key}。請檢查 .env 設定檔。`);
  }
  return value;
}

export const TOKEN = requireEnv('DISCORD_TOKEN');
export const CLIENT_ID = requireEnv('CLIENT_ID');
export const GUILD_ID = process.env['GUILD_ID']; // 可選，用於開發測試
export const PORT = parseInt(process.env['PORT'] ?? '3000', 10);
