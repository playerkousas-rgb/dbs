# v2.2 更新說明 (2026-05-27)

## 本次新增：家長確認流程

### 流程變更
**舊流程**：提交 → 待團長確認 → 待區批核 → ...
**新流程**：提交 → **待家長確認** → 待團長確認 → 待區批核 → ...

### 改動清單

#### 前端 (Next.js / Vercel)
| 檔案 | 改動 |
|------|------|
| `app/apply/page.tsx` | ★ 新增「家長/監護人資料」區域（家長姓名、家長電郵，**必填**）|
| `app/status/page.tsx` | ★ 進度追蹤新增「待家長確認」步驟 |
| `app/admin/page.tsx` | ★ 後台新增「待家長確認」統計卡、待批列表顯示家長狀態 |
| `lib/api.ts` | ★ 新增 `parentConfirm` API |

#### 後端 (Apps Script)
| 函數 | 改動 |
|------|------|
| `handleSubmitApplication` | ★ 初始狀態改為「待家長確認」，寫入 parent_name/parent_email，發送家長確認電郵 |
| `handleParentConfirm` | ★★ 全新函數：家長確認後改狀態為「待團長確認」，並自動發送團長通知 |
| `handleLeaderConfirm` | 不變，但現在只有家長確認後才會收到 |
| 所有讀取函數 | ★ 改用 `headers.indexOf()` 定位欄位，不再硬編碼欄位位置 |

---

## ⚠️ 你需要做的操作

### Step 1: Applications 工作表新增 4 欄
在你的 Google Sheet **Applications** 分頁中：

1. 找到 `email` 欄（目前是 G 欄）
2. 在 `email` 之後、`ym_number` 之前**插入 4 個新欄位**
3. 在標題行填入：

| 新欄位名稱 | 說明 |
|-----------|------|
| `parent_name` | 家長姓名 |
| `parent_email` | 家長電郵 |
| `parent_confirmed_at` | 家長確認時間（系統自動填） |
| `parent_confirmed_by` | 家長確認方式（系統自動填） |

**操作圖示**：
```
之前：... | email | ym_number | ...
之後：... | email | parent_name | parent_email | parent_confirmed_at | parent_confirmed_by | ym_number | ...
```

### Step 2: 更新 Apps Script
1. 開啟 Google Sheet → 擴充功能 → Apps Script
2. 將 `apps-script/Code.gs` 的內容**完全替換**現有的 Code.gs
3. **這只是替換程式碼，不會覆蓋任何工作表資料！**
4. 儲存 → 部署 → 管理部署 → 編輯（鉛筆圖示）→ 版本選「新版本」→ 部署

### Step 3: Push to GitHub
```bash
cd dbs
git add -A
git commit -m "v2.2: 家長確認流程 + header 定位"
git push
```
Vercel 會自動重新部署。

---

## 關於你的其他問題

### Q: 運行 GS 會否把現在資料全部蓋掉？
**不會！** Apps Script 的 Code.gs 只是程式碼（函數定義），跟 Sheet 裡的資料是完全分開的。
- ✅ 替換 Code.gs = 只是更新程式邏輯
- ✅ Config 工作表的設定值不受影響
- ✅ Groups、BadgeCodes 的資料不受影響
- ✅ 你的時間設定不需要重設

### Q: 需要重設時間設定嗎？
**不需要。** Config 工作表裡的 `EXAM_DEADLINE_DAYS`、`LEADER_TIMEOUT_HOURS` 等值
都是存在 Sheet 裡的，替換 Code.gs 不會動到它們。

### Q: GitHub 有沒有檔案要更新？
**有，以下檔案需要 push 到 GitHub：**
- `apps-script/Code.gs` — 完整後端（你需要手動貼到 Apps Script）
- `app/apply/page.tsx` — 報考表單（加入家長欄位）
- `app/status/page.tsx` — 進度查詢（加入家長確認步驟）
- `app/admin/page.tsx` — 後台（加入家長統計）
- `lib/api.ts` — API（加入 parentConfirm）
- `CHANGELOG_v2.2.md` — 本文件
