# 筲箕灣區專章報考系統 v3.0 — 最終設計藍圖

> 定稿日期：2026-05-27
> 本文件鎖定前後端串接前的所有規格決策，作為 Apps Script 與前端開發的單一依據。

---

## 一、最終確認的核心規則

### 規則 1：主考管理（Matrix 為主表，單向同步）

- **ExaminerMatrix** = 唯一真實來源（Source of Truth）
- 所有寫入皆走 Matrix：
  - ADC 批核新主考 → 寫入 Matrix
  - 秘書改 D ↔ G → 直接改 Matrix
  - 秘書刪除主考 → 直接清空 Matrix 該行
- **Examiners** 表由 Apps Script `onEdit` Trigger 自動從 Matrix 反推產生（供 API 快速讀取）
- 同步方向：**Matrix → Examiners（單向）**

### 規則 2：ADC 主考批核 UI

- ADC 在 `/adc` 後台看到每位申請人的章列清單
- **每章獨立勾選**（申請 10 章，可只勾 2 章）
- 每章可獨立選擇 **D（區主考）或 G（旅團主考）**
- 按下「確認批核」→ 已勾選項目寫入 Matrix → 觸發同步

### 規則 3：主考自動派發（同旅 G 優先 → 廣播 D 搶單）

```
團長確認後 → 系統檢查申請表是否已選主考：

IF 考生已自選主考（必為同旅 G 主考）
    └─ 直接派發，寄通知信給該主考
    
ELSE（考生未選，要區會派發）
    Step 1: 查詢同旅團的 G 主考且有此章資格者
        ├─ 找到 → 派給負荷（in-progress 案件）最低的同旅 G 主考
        └─ 找不到 → 進入 Step 2
    
    Step 2: 廣播搶單給所有合資格 D 主考
        ├─ 同時寄信給所有 D 主考，信內含「接單」按鈕
        ├─ 第一個按下接單者 → 鎖定為該案主考
        ├─ 其餘 D 主考收到通知「已被其他主考接走」
        ├─ 72 小時無人接 → 通知秘書手動指派
        └─ 鎖定後開始 90 天考期倒數
```

### 規則 4：考生自選主考 UI 過濾

- 在 `/apply` 選擇「自行安排主考」時：
  - 主考下拉清單**只顯示同旅團 G 主考**
  - 並依所選專章再次過濾（必須具備該章資格）
- 選擇「由區會派發」時：不顯示主考欄

### 規則 5：證書領取（雙模式並存）

| 模式 | 操作方式 | 觸發動作 |
|---|---|---|
| A：手動 | 秘書在 `/admin` 點「已領取」按鈕 | 寫入 `picked_up_at` |
| B：QR Code | 證書印 QR，秘書手機掃描 | 寫入 `picked_up_at` |

兩者皆觸發：
- 移出公開待領頁 `/certificates`
- 寄送完成通知信給考生 / 家長

### 規則 6：雙後台分權（兩個 Token）

| 後台 | 路徑 | 角色 | Token (Config) | 主要權限 |
|---|---|---|---|---|
| ADC 老闆台 | `/adc` | 助理區總監 | `ADC_TOKEN` | 主考申請審批（勾選 + D/G）|
| 秘書日常台 | `/admin` | 專章秘書 | `STAFF_TOKEN` | 報考申請審批、Matrix 編輯、證書印製/領取、報表 |

兩個 token 都存在 `Config` 工作表。

### 規則 7：進度查詢

- `/status`：考生輸入「申請編號 + YMIS 童軍編號」雙重驗證

---

## 二、Apps Script 分檔結構（12 個檔案）

```
📂 Apps Script 專案
│
├── Code.gs                  ★ doGet / doPost 路由總入口 + onEdit 入口
├── Config.gs                ★ Sheet ID、欄位常數、Token、時限設定
│
├── 📂 業務邏輯（Routes）
│   ├── Apply.gs             → submitApplication / parentConfirm / leaderConfirm
│   ├── Examiner.gs          → examinerSubmitResult / examinerAcceptInvitation（搶單）
│   ├── Assignment.gs        → 派發演算法（同旅 G 優先 → 廣播 D 搶單）
│   ├── Certificate.gs       → markReady / markPickedUp / getPendingCerts
│   ├── ExaminerApply.gs     → 主考申請 + ADC 審批 + 寫入 Matrix
│   └── Status.gs            → 進度查詢（getStatus）
│
├── 📂 工具 / 共用
│   ├── SheetUtils.gs        → 共用：依 header 找欄位、appendRow、updateRow
│   ├── Mailer.gs            → Email 範本 + sendMail()
│   ├── TokenUtils.gs        → 產生 / 驗證 token（家長、團長、主考用）
│   ├── MatrixSync.gs        → onEdit 監聽 + Matrix → Examiners 同步邏輯
│   └── Validator.gs         → 表單驗證
│
└── 📂 讀取 API（Reads - GET）
    └── Reads.gs             → getBadgeCodes / getGroups / getActiveExaminers / getPendingCertificates
```

### 為什麼這樣分？

| 設計考量 | 對應做法 |
|---|---|
| Apps Script 限制 `doGet` / `doPost` 全域唯一 | 集中在 `Code.gs` 用 action 路由分派 |
| Matrix 同步邏輯複雜，怕牽動其他功能 | 獨立成 `MatrixSync.gs`，秘書改錯不會傷到派發邏輯 |
| 派發演算法日後可能調整（如改成排程） | 獨立成 `Assignment.gs`，未來只動這檔 |
| 所有讀取（GET）共用相同 CORS 與快取邏輯 | 集中到 `Reads.gs` |
| Email 範本可能要常改文案 | 集中到 `Mailer.gs`，秘書日後可自己改範本 |

---

## 三、Sheet 結構補充（在現有基礎上要加的）

### 新增工作表

#### `ExaminerApplications`（主考申請暫存）

| 欄位 | 說明 |
|---|---|
| application_id | EA-yyyymmdd-xxx |
| submitted_at | 提交時間 |
| applicant_name | 申請人姓名 |
| applicant_ym | 申請人 YMIS |
| applicant_email | 申請人電郵 |
| applicant_group | 申請人所屬旅團 |
| requested_badges | JSON 字串：[{badge:"急救", scope:"D"}, ...] |
| status | pending / partially_approved / rejected |
| reviewed_at | ADC 審批時間 |
| reviewed_by | ADC 名稱 |
| approved_badges | JSON 字串：實際核准的章與 D/G |
| remarks | 備註 |

#### `ExaminerInvitations`（廣播搶單記錄）

| 欄位 | 說明 |
|---|---|
| invitation_id | INV-yyyymmdd-xxx |
| application_id | 對應的考章申請 ID |
| broadcast_at | 廣播時間 |
| invited_examiners | JSON：被通知的 D 主考名單 |
| accepted_by | 接單主考名稱（null = 未接） |
| accepted_at | 接單時間 |
| status | broadcasting / accepted / timeout / manual_assigned |
| expires_at | broadcast_at + 72h |

### Applications 補欄位

| 新欄位 | 說明 |
|---|---|
| invitation_id | 若走廣播流程，記錄對應 invitation_id |

---

## 四、Config 工作表新增設定

| Key | 範例值 | 用途 |
|---|---|---|
| ADC_TOKEN | adc-xxxx | ADC 後台登入密碼 |
| STAFF_TOKEN | staff-xxxx | 秘書後台登入密碼（已有）|
| BROADCAST_TIMEOUT_HOURS | 72 | D 主考廣播搶單時限 |
| EXAM_DEADLINE_DAYS | 90 | 考期天數（已有）|
| LEADER_TIMEOUT_HOURS | 72 | 團長確認時限（已有）|

---

## 五、實作順序建議

1. **第 1 步**：建立 `Config.gs` + `SheetUtils.gs` + `TokenUtils.gs`（地基）
2. **第 2 步**：建立 `Code.gs` 路由骨架 + `Reads.gs`（讓前端讀取功能先活）
3. **第 3 步**：建立 `Apply.gs` + `Mailer.gs`（報考流程：提交 → 家長 → 團長）
4. **第 4 步**：建立 `Assignment.gs` + `Examiner.gs`（派發 + 搶單 + 成績回報）
5. **第 5 步**：建立 `Certificate.gs`（證書隊列 + 領取）
6. **第 6 步**：建立 `ExaminerApply.gs` + `MatrixSync.gs`（主考申請 + 同步）
7. **第 7 步**：補上前端 `/adc` 頁面與 lib/api.ts 新增的 endpoints

---

## 六、待你準備的事項

- [ ] Google Sheet 新增 `ExaminerApplications` 工作表（按上述欄位）
- [ ] Google Sheet 新增 `ExaminerInvitations` 工作表（按上述欄位）
- [ ] Applications 工作表新增 `invitation_id` 欄
- [ ] Config 工作表新增 `ADC_TOKEN`、`BROADCAST_TIMEOUT_HOURS`
- [ ] 確認 Examiners 與 ExaminerMatrix 兩個 Sheet 的當前欄位結構（截圖或貼上欄位名給我）
