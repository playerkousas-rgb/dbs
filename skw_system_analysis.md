# 筲箕灣區專章系統 — 基於真實試算表的深度分析

> 資料來源：專章秘書現用核心試算表（2012–2025，>2500 行）

---

## 一、現有欄位結構（21 欄）

| # | 欄位名稱 | 觀察 |
|---|---------|------|
| 1 | 編號 | 流水號，從 0 開始 |
| 2 | 申請日期 | 格式混亂：`31-7月-2012`、`03-9月-2013` |
| 3 | 批核日期 | 與申請日期相同或延遲數月 |
| 4 | 個人資料 旅號 | 純數字，如 `82`、`1539` |
| 5 | 旅團 | 全名如「港島第八十二旅」，含文字數字混合 |
| 6 | 姓名 | 中文 |
| 7 | Name | **幾乎全部空白**，英文姓名未要求填寫 |
| 8 | 電話 | 成員聯絡電話 |
| 9 | YMIS | **幾乎全部空白**，童軍總會會員編號未利用 |
| 10 | 電郵 | 成員/家長電郵 |
| 11 | 專章 | 名稱，如「社區參與」、「服務 - 語言」 |
| 12 | 考核狀況 批核人 | 審批人姓名（鄧靜雯、袁可秀、莫穎民等） |
| 13 | 主考 | 主考姓名，或「証書換專章」、「東九龍訓練班」 |
| 14 | 主考電話 | **絕大部份空白**，聯絡主考需另外查找 |
| 15 | 結果 | `P`（合格）、`F`（不合格）、空白（未完成） |
| 16 | 完成日期 | 考驗完成日期 |
| 17 | 證書 編號 | 格式 `CIB/HKIR/2013/SKW/5`，但失敗時也填 `F` |
| 18 | 領取人 | 領取證書者姓名，有時是成員、有時是團長 |
| 19 | 領取日期 | 日期格式更不統一：`27.9.2013`、`05.12.2013` |
| 20 | Remarks | 備註，如「因故未能於2星期內處理」 |
| 21 | （空白） | |

---

## 二、從真實數據發現的核心痛點

### 1. 單一大表設計災難
- 超過 2500 行在同一工作表，載入極慢
- 任何人手誤改一格都難以察覺和復原
- 沒有操作紀錄（Audit Log）
- 同時編輯會產生衝突

### 2. 「狀態」全靠人腦推斷
- 沒有統一「狀態」欄，必須從以下條件推斷：
  - 只有「申請日期」= 剛提交
  - 有「批核日期」= 已批核
  - 有「主考」但無「結果」= 進行中
  - 「結果」= P + 有「完成日期」= 合格待製證書
  - 「證書編號」有值 + 「領取日期」空白 = 待領取
  - 「證書編號」= F = 不合格（這是極度混亂的設計）

### 3. 特殊流程沒有標記
- 「証書換專章」被填在「主考」欄，系統無法區分這是考核還是換領
- 「東九龍訓練班」也被填在主考欄，屬於訓練班模式
- 沒有「申請模式」欄位來區分：自行報考 / 區委派 / 訓練班 / 証書換專章

### 4. 主考聯絡資訊斷層
- 主考電話 90% 以上空白
- 要聯絡主考必須另外查閱「主考名單」，但該名單可能與此表不同步
- 沒有「主考是否接受指派」的狀態

### 5. 證書編號欄位被濫用
- 合格時：`CIB/HKIR/2013/SKW/5`
- 不合格時：填 `F`
- 未完成時：空白
- 這導致無法用程式自動判斷，必須人工讀取

### 6. 日期格式完全不統一
- 申請日期：`31-7月-2012`
- 完成日期：`27-9月-2012`
- 領取日期：`27.9.2013`、`05.12.2013`
- 混合中文月份名稱和點號格式，任何自動化腳本都難以解析

### 7. 缺乏團長確認環節的記錄
- 現有表中沒有「團長確認」欄位
- 也沒有「家長通知」紀錄
- PT03 要求的知會流程在此表中完全不可見

### 8. 批核人直接寫入自由文本
- 「鄧靜雯」、「袁可秀」、「莫穎民」等批核人姓名直接寫入
- 沒有標準化 ID，無法統計誰批了多少、平均處理時間

---

## 三、新系統必須修正的設計原則

| 原則 | 現有問題 | 新設計 |
|------|---------|--------|
| **單一真相來源 (Single Source of Truth)** | 資料分散在6個資料夾+多個試算表 | 統一 Google Sheet，分工作表管理，前端只讀寫 API |
| **狀態機 (State Machine)** | 靠多欄位組合推斷狀態 | 明確定義狀態欄：`待團長確認` → `待區批核` → `已批核待派主考` → `已派主考進行中` → `合格待製證書` → `待領取` → `已完成` / `不合格` |
| **標準化主鍵** | 流水號從 0 開始，無年度/區域區分 | 申請 ID：`SKW-YYYYMMDD-NNNN` |
| **分離特殊流程** | 換領/訓練班/考核混在一起 | `申請模式`欄位明確標記：`SELF_EXAMINER` / `DISTRICT_ASSIGN` / `TRAINING_COURSE` / `CERTIFICATE_EXCHANGE` |
| **主考資料庫獨立** | 主考電話大部份空白 | 獨立 `Examiners` 工作表，主考 ID 外鍵引用 |
| **日期標準化** | 格式混亂 | 全部使用 ISO 8601 (`YYYY-MM-DD`)，Apps Script 自動處理 |
| **操作紀錄 (Audit Trail)** | 無 | 每次狀態改變自動寫入 `AuditLog` |
| **團長/家長確認可追蹤** | PT03 流程不可見 | 獨立記錄團長確認時間戳、家長通知時間戳 |

---

## 四、新系統工作表結構（共 8 個分頁）

### `Config`（系統設定）
```
Key                | Value
-------------------|------------------
DISTRICT_NAME      | 筲箕灣區
CURRENT_TERM_START | 2025-04-01
CURRENT_TERM_END   | 2027-03-31
EMAIL_REPLY_TO     | badge@skwscout.org.hk
AUTO_REMINDER_DAYS | 60
EXAM_DEADLINE_DAYS | 90
LEADER_TIMEOUT_HRS | 72
```

### `Groups`（旅團資料）
```
group_id | group_name       | group_number | leader_name | leader_email      | assistant_leader_email | district_area
---------|------------------|--------------|-------------|-------------------|------------------------|--------------
G-015    | 港島第十五旅      | 15           | 陳大文       | leader@email.com  | asst@email.com         | 柴灣
G-082    | 港島第八十二旅    | 82           | ...         | ...               | ...                    | 筲箕灣
```

### `Members`（成員資料—可選，自動累積）
```
member_id | name    | group_id | phone     | email              | ym_number | created_at
----------|---------|----------|-----------|--------------------|-----------|------------
M-001     | 張小明   | G-015    | 91234567  | parent@email.com   | YM123456  | 2025-05-20
```

### `Examiners`（主考名冊）
```
examiner_id | name    | email        | phone    | qualified_badges      | term_start | term_end   | status      | current_load | max_load
------------|---------|--------------|----------|-----------------------|------------|------------|-------------|--------------|----------
E-001       | 李主考   | lee@email.com| 91234567 | 露營,急救,先鋒工程     | 2025-04-01 | 2027-03-31 | ACTIVE      | 2            | 5
E-002       | 王主考   | wong@email   | 92345678 | 社區參與,語言          | 2023-04-01 | 2025-03-31 | EXPIRED     | 0            | 0
```

### `Applications`（申請紀錄 — 核心）
```
application_id  | submitted_at       | member_name | group_id | badge_name | mode              | self_examiner_name | leader_confirmed_at | leader_confirmed_by | district_approved_at | district_approved_by | assigned_examiner_id | assigned_at        | exam_deadline | result | result_date | certificate_number | certificate_ready_at | picked_up_by | picked_up_at | status                    | remarks
----------------|--------------------|-------------|----------|------------|-------------------|--------------------|---------------------|---------------------|----------------------|----------------------|----------------------|--------------------|------------------|-------------|--------|-------------|--------------------|----------------------|--------------|--------------|---------------------------|--------
SKW-250520-0001 | 2025-05-20 14:30   | 張小明       | G-015    | 急救        | DISTRICT_ASSIGN   |                    | 2025-05-20 15:00    | leader@email.com    | 2025-05-21 10:00     | asst_district@email  | E-001                | 2025-05-21 10:30 | 2025-08-19    | PASS   | 2025-06-15  | SFA/HKIR/2025/SKW/1| 2025-06-20           | 張小明        | 2025-06-25   | COMPLETED                 |
SKW-250521-0002 | 2025-05-21 09:00   | 李小红       | G-082    | 露營        | SELF_EXAMINER     | 王明灝              | 2025-05-21 12:00    | leader2@email       | 2025-05-21 14:00     | asst_district@email  | E-005                | 2025-05-21 14:30 | 2025-08-20    |        |             |                    |                      |              |              | ASSIGNED_EXAMINER_IN_PROGRESS |
```

### `Certificates`（證書隊列—獨立於申請表）
```
certificate_id | application_id     | badge_name | member_name | group_id | result_date | certificate_number | status      | ready_at   | notified_at | picked_up_by | picked_up_at | notes
---------------|--------------------|------------|-------------|----------|-------------|--------------------|-------------|------------|-------------|--------------|--------------|-------
CERT-0001      | SKW-250520-0001    | 急救        | 張小明       | G-015    | 2025-06-15  | SFA/HKIR/2025/SKW/1| PICKED_UP   | 2025-06-20 | 2025-06-20  | 張小明        | 2025-06-25   |
CERT-0002      | SKW-250522-0003    | 先鋒工程    | 王大文       | G-015    | 2025-06-10  | SPW/HKIR/2025/SKW/2| READY       | 2025-06-18 | 2025-06-18  |              |              | 待領取
```

### `AuditLog`（操作紀錄）
```
log_id | timestamp          | action                        | application_id     | user_email       | details
-------|--------------------|-------------------------------|--------------------|------------------|----------------------------------
1      | 2025-05-20 14:30   | APPLICATION_SUBMITTED         | SKW-250520-0001    | system           | 成員透過網站提交
2      | 2025-05-20 14:31   | LEADER_NOTIFICATION_SENT      | SKW-250520-0001    | system           | 發送電郵至 leader@email.com
3      | 2025-05-20 14:31   | PARENT_NOTIFICATION_SENT      | SKW-250520-0001    | system           | 發送電郵至 parent@email.com
4      | 2025-05-20 15:00   | LEADER_CONFIRMED              | SKW-250520-0001    | leader@email.com | 團長一鍵確認
5      | 2025-05-21 10:00   | DISTRICT_APPROVED               | SKW-250520-0001    | asst_district@   | 助理區總監審批通過
6      | 2025-05-21 10:30   | EXAMINER_ASSIGNED               | SKW-250520-0001    | system           | 自動分配主考 E-001
7      | 2025-05-21 10:31   | EXAMINER_NOTIFICATION_SENT      | SKW-250520-0001    | system           | 發送電郵至主考
8      | 2025-06-15 16:00   | EXAMINER_RESULT_SUBMITTED       | SKW-250520-0001    | examiner@email   | 主考提交成績：合格
9      | 2025-06-20 09:00   | CERTIFICATE_READY               | SKW-250520-0001    | staff@email      | 職員標記證書可領取
10     | 2025-06-25 14:00   | CERTIFICATE_PICKED_UP           | SKW-250520-0001    | staff@email      | 成員親身領取
```

### `ExaminerAppointments`（主考委任紀錄）
```
appointment_id | examiner_id | badge_name | term_start | term_end   | approved_by | approved_at        | status    | renewal_reminder_sent
---------------|-------------|------------|------------|------------|-------------|--------------------|-----------|------------------------
APT-001        | E-001       | 急救        | 2025-04-01 | 2027-03-31 | 莫穎民       | 2025-03-15         | ACTIVE    | FALSE
```

---

## 五、Apps Script Web App API 設計（核心端點）

### 公開端點（無需登入，只讀）
```
GET  /api/status?app_id=SKW-250520-0001&phone=91234567
     → 返回申請進度（供成員查詢）

GET  /api/certificates/pending
     → 返回待領取證書公開列表（無個人資料，供網站顯示）

GET  /api/examiners/active
     → 返回現任主考名單（含可考核專章）
```

### 成員端點（透過網站提交）
```
POST /api/applications
     Body: { member_name, group_id, phone, email, badge_name, mode, self_examiner_name? }
     → 創建申請，自動發送團長/家長通知
```

### 團長端點（一鍵確認連結）
```
POST /api/applications/{id}/leader-confirm?token=xxxx
     → 團長確認，無需登入，token 限時 72 小時
```

### 主考端點（專屬連結）
```
GET  /api/examiner/pending?token=xxxx
     → 主考查看待考核名單

POST /api/examiner/{id}/result?token=xxxx
     Body: { application_id, result: PASS/FAIL, remarks }
     → 提交成績
```

### 區職員端點（後台管理，需 district_staff_token）
```
GET  /api/admin/applications?status=待區批核
POST /api/admin/applications/{id}/approve
POST /api/admin/applications/{id}/assign-examiner
     Body: { examiner_id }（可自動或手動指定）
POST /api/admin/certificates/{id}/mark-ready
POST /api/admin/certificates/{id}/mark-picked-up
GET  /api/admin/reports/monthly
```

---

## 六、關鍵自動化邏輯（Apps Script Triggers）

### Trigger 1: 每小時檢查團長逾時
```
IF status == "待團長確認" AND now > leader_confirmed_at + 72 hours
   → 發送催辦通知給團長 + 助理團長
   → 可選：若再過 24 小時仍未確認，自動改為「待區批核」（需你確認是否啟用此功能）
```

### Trigger 2: 每日檢查考驗限期
```
IF status == "已派主考進行中" AND now > exam_deadline - 7 days
   → 發送「限期將至」提醒給主考 + 成員

IF status == "已派主考進行中" AND now > exam_deadline
   → 自動標記 result = FAIL, result_date = now
   → 發送「逾期不合格」通知給成員 + 團長
   → 可選：自動發送重新報考連結
```

### Trigger 3: 主考續任提醒
```
IF examiner term_end < now + 60 days AND renewal_reminder_sent == FALSE
   → 發送續任提醒電郵
   → 標記 renewal_reminder_sent = TRUE

IF examiner term_end < now
   → 標記 status = EXPIRED
   → 從自動分配池中移除
```

---

## 七、Vercel 前端頁面規劃

| 頁面 | 功能 | 登入要求 |
|------|------|---------|
| `/` | 筲箕灣區專章系統首頁，簡介 + 報考入口 + 進度查詢 | 無 |
| `/apply` | 成員報考表單（選專章、選模式、填資料） | 無 |
| `/status` | 進度查詢（輸入申請ID + 電話後4碼） | 無 |
| `/certificates` | 公開待領取證書列表（顯示「港島第十五旅 張小明 急救 待領取」） | 無 |
| `/admin` | 區職員後台（審批、派主考、標記證書、查看報表） | 密碼/token |
| `/examiner` | 主考專屬頁面（透過電郵連結內的 token 自動登入） | Token |
| `/leader-confirm` | 團長一鍵確認頁面（透過電郵連結） | Token |

---

## 八、實施建議（基於你說「新系統從零開始，舊表維持不動」）

### Phase 1（本週可完成）：建立新基礎建設
1. 建立新 Google Sheet「SKW_Badge_System_v2」按上述 8 個工作表結構
2. 填入 `Config`、`Groups`、`Examiners` 初始資料（從舊表手動匯入或新建）
3. 部署 Apps Script Web App 基礎框架（提供 `/api/status`、`/api/applications` POST）
4. 建立 Vercel 基礎專案，部署「報考表單」+「進度查詢」+「待領取列表」

### Phase 2（下週）：審批與通知自動化
1. 實現團長確認連結（含 72 小時 token）
2. 實現區職員後台審批界面
3. 實現主考自動分配演算法
4. 串接 Gmail 自動發送通知（提交確認、團長通知、家長通知、主考指派）

### Phase 3（第三週）：主考與成績回報
1. 開發主考專屬連結頁面
2. 實現成績提交 + 自動更新證書隊列
3. 開發證書待領取管理後台

### Phase 4（第四週）：主考委任與報表
1. 開放主考委任申請表單
2. 自動續任提醒
3. 統計報表（每月報考數、合格率、平均處理時間、主考工作量）

---

**請確認以下細節後我立即開始寫程式碼：**

1. **團長逾時 72 小時後**：只發催辦通知，還是超過某時限後自動跳過團長直送區會？（這會影響 Apps Script trigger 的設計）

2. **成員報考時是否需要選擇「自行安排主考」**：如果選了但主考不在名冊/不合資格，系統是否自動改為「區委派」，還是退回給成員重新選擇？

3. **證書編號格式**：是否沿用現有格式 `CIB/HKIR/YYYY/SKW/NNN`？這個格式中各段代表什麼（如 CIB=Community Involvement Badge?）？

4. **你希望我現在就開始寫 Phase 1 的程式碼（Apps Script + Vercel 前端），還是先建立好新 Google Sheet 結構讓你看看？**