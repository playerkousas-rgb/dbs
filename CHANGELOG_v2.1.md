# v2.1 更新說明 (2026-05-27)

## 本次修改內容

### ✅ 1. Vercel Deployment Protection
- **已確認關閉** — 網站 https://dbs-teal-iota.vercel.app/ 可以正常公開訪問

### 🔧 2. 主考資料：D/G 分類 + 動態讀取
**問題**：主考資料分為 D（區主考）和 G（旅團主考），格式是橫向打勾表

**解決方案**：
- Apps Script 直接讀取你的主考 Excel 檔案（`1iR3r0dYBKQfFZmq3tEy0lrzGCruxTZJC`）
- 自動解析技能組、服務組等分頁
- 每個主考的每個專章記錄 D 或 G 標記
- **不需要一個主考設 10 行**，系統會自動從橫向表格中讀取所有打勾的專章

**D/G 的業務邏輯**：
- **D（區主考）**：接受區內任何旅團的成員報考
- **G（旅團主考）**：只接受自己旅團的成員報考
- 報考表單會自動篩選：如果選了 G 主考但不是同旅團，會顯示「不可選」

### 🔧 3. 專章 BadgeCodes 動態讀取
**問題**：專章代碼更新後需要改程式碼

**解決方案**：
- 新增 API `getBadgeCodes` — 從 Google Sheet 的 `BadgeCodes` 分頁動態讀取
- 報考表單的專章選擇是動態的，按類別（興趣/技能/服務/教導）分組篩選
- 秘書後台新增「專章代碼」頁面，可檢視所有有效專章
- **秘書只需在 Sheet 更新 BadgeCodes 分頁，前端自動反映**

### 🔧 4. 旅團團長空缺處理
**問題**：有些旅團暫時沒有團長（G-086、G-182、G-206、G-1095 等）

**解決方案**：
- 沒有團長的旅團，確認通知發送至旅團公用 Email（如 `86thhkg.sl@skwscout.org.hk`）
- 旅團選單中標示 ⚠️ 表示沒有登記團長
- Email 稱謂使用「XXX旅童軍團負責領袖」代替「XXX 團長」
- 狀態仍為「待團長確認」，由收到 email 的人點擊確認
- **不會因為沒團長而阻止報考**

### 🔧 5. 姓名格式
**方案**：在 Sheet 中直接存「XXX先生」或「XXX女士」等完整稱謂
- 團長顯示為「XXX 團長」
- 沒有團長時顯示「XXX旅童軍團負責領袖」
- 主考名稱直接使用 Sheet 中的原始值（如「盧凱康先生」）

### 🔧 6. 證書 Word 合併列印
**現有模版分類**：
- 興趣/技能/服務/教導 → 同一種模版
- 其他特殊章（社區參與、航空、海事等）→ 各自專屬模版

**系統配合**：
- 列印清單自動包含 `badge_code`、`category` 欄位
- 方便根據類別篩選不同模版

---

## 需要你做的操作

### Step 1: 更新 Apps Script
1. 開啟你的 Google Sheet
2. 擴充功能 → Apps Script
3. 將 `apps-script/Code.gs` 的內容全部替換現有的 Code.gs
4. 儲存 → 部署 → 管理部署 → 編輯 → 版本選「新版本」→ 部署

### Step 2: 確認主考 Excel 分享權限
- 檔案 `1iR3r0dYBKQfFZmq3tEy0lrzGCruxTZJC` 需要設定為：
  - Apps Script 的執行帳號可以讀取
  - 建議設為「知道連結的人都可以檢視」

### Step 3: 填寫 Config
在 Config 工作表填寫：
- `STAFF_TOKEN`：設一個秘書登入密碼
- `WEB_APP_URL`：填入 Apps Script 部署後的 URL
- `EMAIL_REPLY_TO`：回覆電郵地址

### Step 4: Git Push 到 GitHub
```bash
git add -A
git commit -m "v2.1: 動態讀取 BadgeCodes/主考、D/G 分類、團長空缺處理"
git push
```
Vercel 會自動重新部署。

---

## 文件結構
```
dbs/
├── app/
│   ├── layout.tsx          # 加入導航列
│   ├── page.tsx            # 首頁（未改）
│   ├── apply/page.tsx      # ★ 報考表單（動態讀取 BadgeCodes, Groups, Examiners）
│   ├── admin/page.tsx      # ★ 秘書後台（新增主考名單、專章代碼頁面）
│   ├── certificates/page.tsx  # 待領證書（未改）
│   ├── examiner/page.tsx   # 主考回報（未改）
│   └── status/page.tsx     # 進度查詢（未改）
├── lib/
│   └── api.ts              # ★ 新增 getBadgeCodes, getGroups API
├── apps-script/
│   └── Code.gs             # ★★★ 完整後端（需貼到 Apps Script）
├── tsconfig.json           # 修復 downlevelIteration
└── CHANGELOG_v2.1.md       # 本文件
```
