# 🚀 YuiKo 開發與 Render 部署指南

## 📋 前置需求

- **Node.js** v18.0.0 以上
- **npm** v8 以上
- 一個已建立的 [Discord Application](https://discord.com/developers/applications)（含 Bot Token）

---

## 💻 本地開發步驟

### 1. 安裝套件

```bash
npm install
```

### 2. 設定環境變數

複製範本並填入你的憑證：

```bash
cp .env.example .env
```

編輯 `.env`：

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# 可選：設定後 deploy-commands 會以伺服器範圍註冊指令（即時生效，僅用於開發）
# GUILD_ID=your_test_guild_id_here

PORT=3000
```

### 3. 從 Discord Developer Portal 取得憑證

1. 前往 [Discord Developer Portal](https://discord.com/developers/applications)
2. 建立或選擇你的 Application
3. 進入 **Bot** 分頁 → 複製 **Token** → 貼入 `DISCORD_TOKEN`
4. 進入 **General Information** → 複製 **Application ID** → 貼入 `CLIENT_ID`

### 4. 邀請機器人進入測試伺服器

在 Developer Portal → **OAuth2** → **URL Generator**：
- Scopes：勾選 `bot` 和 `applications.commands`
- Bot Permissions：勾選 `Send Messages`、`Embed Links`、`Use Slash Commands`

複製生成的 URL 並在瀏覽器中開啟，邀請機器人進入你的測試伺服器。

### 5. 註冊 Slash Commands

```bash
npm run deploy-commands
```

> **提示：** 若 `.env` 中有設定 `GUILD_ID`，指令會立即在該伺服器生效。  
> 若未設定，則為全域註冊，最長需等待 **1 小時**才能在所有伺服器看到指令。

### 6. 啟動本地開發伺服器

```bash
npm run dev
```

控制台應顯示：
```
🌐 Health-check 伺服器啟動於 port 3000
🐟 YuiKo (小魚子) 已上線！
✅ 登入身份：YuiKo#1234
📡 已連接 1 個伺服器
🎲 已載入 5 個指令
```

---

## 🌐 Render 雲端部署步驟

### 方法一：Web Service（推薦，包含 Health-Check）

1. 在 GitHub 建立儲存庫並推送程式碼：
   ```bash
   git init
   git add .
   git commit -m "feat: initial YuiKo setup"
   git remote add origin https://github.com/your-username/yuiko.git
   git push -u origin main
   ```

2. 開啟 [Render Dashboard](https://dashboard.render.com/)

3. 點選 **New +** → **Web Service**

4. 連結你的 GitHub 儲存庫

5. 設定以下參數：

   | 設定項目 | 值 |
   |--------|-----|
   | **Name** | `yuiko` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install && npm run build && node dist/interactions/deploy-commands.js` |
   | **Start Command** | `npm run start` |

6. 點選 **Advanced** → **Add Environment Variable**，新增：
   - `DISCORD_TOKEN` = 你的 Bot Token
   - `CLIENT_ID` = 你的 Application ID
   - `GUILD_ID` = 你的伺服器 ID（**必填**，讓指令即時生效；不填則全域註冊需等 1 小時）

7. 點選 **Create Web Service** 開始部署

8. 部署完成後，在 Render 提供的 URL 後加上 `/health` 確認機器人狀態：
   ```
   https://yuiko.onrender.com/health
   ```

### 方法二：Background Worker（無 HTTP 端點，更省資源）

步驟同上，但選擇 **Background Worker** 而非 Web Service。  
注意：Background Worker 在 Render 免費版上可能因閒置而休眠。

### Render 免費版注意事項

- 免費版 Web Service 閒置 **15 分鐘**後會休眠
- 可使用 [UptimeRobot](https://uptimerobot.com/) 等服務每 10 分鐘 Ping 一次 `/health` 端點，防止休眠
- 監控 URL：`https://your-app.onrender.com/health`

---

## 🔧 可用的 npm 指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動本地開發伺服器（支援熱重載） |
| `npm run build` | 編譯 TypeScript 至 `dist/` 目錄 |
| `npm run start` | 執行編譯後的生產版本 |
| `npm run deploy-commands` | 向 Discord API 註冊 Slash Commands |

---

## 📁 專案結構

```
YuiKo/
├── src/
│   ├── index.ts                 # 進入點：Discord Client + Express 健康檢查
│   ├── config.ts                # 環境變數載入與驗證
│   ├── services/                # 核心業務邏輯
│   │   ├── DiceService.ts       # 骰子解析與擲骰邏輯
│   │   ├── ChoiceService.ts     # 隨機選擇與 Fisher-Yates 洗牌
│   │   ├── FortuneService.ts    # 每日運勢（種子隨機）與塔羅占卜
│   │   ├── MemeService.ts       # 台詞圖片模糊搜尋
│   │   └── RouletteService.ts   # 輪盤動畫幀生成
│   ├── interactions/
│   │   ├── commands/            # Slash Command 處理器
│   │   │   ├── roll.ts
│   │   │   ├── choice.ts
│   │   │   ├── fortune.ts
│   │   │   ├── quote.ts
│   │   │   └── spin.ts
│   │   └── deploy-commands.ts   # 指令註冊腳本
│   └── assets/
│       ├── tarot.json           # 78 張塔羅牌資料庫
│       └── quotes.json          # 跑團台詞迷因資料庫
├── dist/                        # TypeScript 編譯輸出（不進版控）
├── .env                         # 環境變數（不進版控）
├── .env.example                 # 環境變數範本
├── package.json
├── tsconfig.json
├── README.md                    # 使用者指令說明
└── DEPLOY.md                    # 此文件
```

---

## 🛠️ 自訂台詞資料庫

編輯 `src/assets/quotes.json`，加入自訂台詞：

```json
{
  "id": 99,
  "text": "你的台詞文字",
  "description": "描述或來源說明",
  "imageUrl": "https://your-image-hosting.com/image.png",
  "tags": ["標籤1", "標籤2", "搜尋關鍵字"]
}
```

修改後需重新執行 `npm run build` 並重啟服務。

---

*YuiKo (小魚子) — 由 Fish 開發維護*
