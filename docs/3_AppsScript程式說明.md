Apps Script 程式說明（主考委任系統 v3.13）
給開發者 / 維護者。列出主考委任相關的所有函式、用途、呼叫關係。
全部位於 code.gs。前端透過 lib/api.ts 以 action 字串呼叫 doPost / doGet。

一、路由（doPost 內的 case）
action	對應函式	用途	權限
submitExaminerApplication	apiSubmitExaminerApplication	主考提交申請	公開
adcVerify	apiAdcVerify	ADC 密鑰驗證	ADC_TOKEN
adcGetPending	apiAdcGetPending	讀待審批清單	ADC_TOKEN
adcApprove	apiAdcApprove	逐章審批	ADC_TOKEN
getExaminerAppointmentStatus	apiGetExaminerAppointmentStatus	申請進度查詢	公開
選單（試算表 onOpen）：

syncExaminerMatrix → 同步 Matrix→Examiners
autoComposeFullTitles → 自動補 full_title
rebuildMatrixHeaderFromBadgeCodes → 重建 Matrix 表頭
showSyncStatus → 查看同步狀態
二、函式清單與用途
申請與審批
函式	用途	重點
apiSubmitExaminerApplication(data)	收申請、存 ExaminerAppointments、寄信	通知收件人 = ADC_EMAIL；信中 ADC 名字解析自 CERT_SIGNER_TITLE_CN；存 badge_scopes
apiAdcGetPending(data)	回傳 status=PENDING_ADC_APPROVAL 的申請	從 notes 解析 badge_scopes，舊資料無則用 badge_name 後備
apiAdcApprove(data)	逐章批准/否決，寫名冊	見下方詳解
apiGetExaminerAppointmentStatus(data)	用 appointmentId 查狀態	公開查詢
apiAdcVerify(data)	驗證 ADC 密鑰	
apiAdcApprove 內部流程（重點函式）
驗 ADC_TOKEN。
從 ExaminerAppointments 取該申請，解析 notes（姓名/電郵/電話/旅團/badge_scopes）。
examinerUnit = normalizeUnit_(旅團) → G-082 轉「港島第82旅」。
寫入 Examiners（找同名列就增量更新，否則新增）：
逐章套用：同章同級 SKIP；同章 G↔D 覆寫；新章加入。
章名一律存 full_title。
writeBadgesToMatrix_() 寫入 ExaminerMatrix（缺欄自動補）。
更新 ExaminerAppointments 狀態（APPROVED / PARTIALLY_APPROVED / REJECTED）。
寄審批結果信給申請人。
自動呼叫 syncExaminerMatrixDirect() 同步。
寄通知信給 DBS（含同步結果）。
工具函式
函式	用途
checkAdcToken_(token)	比對 Config 的 ADC_TOKEN
splitBadgeList_(raw)	逗號清單轉陣列，過濾 #N/A 等雜訊
getActiveFullTitles_()	讀 BadgeCodes 全部 active 章的 full_title（依序）
normalizeUnit_(groupIdOrName)	group_id → 「港島第XX旅」；DISTRICT → 區職員
writeBadgesToMatrix_(ss, name, unit, badges)	寫 D/G 進 Matrix；缺欄自動補在最右；用 1-based 列號避免 off-by-one
工作表維護工具（選單觸發）
函式	用途	安全性
autoComposeFullTitles()	只補 full_title 空白的列（= 類別+" - "+章名）；已填的不動	不動既有資料
validateBadgeCodes_()	檢查 active 章的 full_title 不可空白/重複	純檢查
rebuildMatrixHeaderFromBadgeCodes()	依 BadgeCodes 重建 Matrix 表頭，保留主考列與 D/G	重建前先 validate
syncExaminerMatrixDirect(ss)	清空 Examiners 後依 Matrix 重建（保留 email/phone/任期/負荷）	依賴 Matrix 完整性
三、被取代 / 停用的舊函式（勿再使用）
舊函式	問題	取代者
apiPartialApproveExaminer	寫入 badge code（報考要 full_title）	apiAdcApprove
apiApproveExaminerAppointment	不同步 Matrix	apiAdcApprove
writeToExaminerMatrix	假設三行表頭（現為單行）	writeBadgesToMatrix_
已建議改名為 OLD_xxx 停用。對應 doPost 的 case 已不再被前端呼叫。

四、資料格式約定
notes 欄（ExaminerAppointments）
以「標籤：值 | 標籤：值」串接。解析用 regex 標籤：([^|]*)。
關鍵標籤：姓名、電郵、電話、旅團、職級、年資、資歷、badge_codes、badge_scopes、提交時間。

badge_scopes（JSON 字串）
JSON

[{ "code": "SIN", "fullTitle": "服務 - 語言 (英語)", "scope": "G" }]
scope：'D' 區主考 / 'G' 旅團主考。
fullTitle 為唯一鑰匙；code 僅參考（可重複）。
Examiners 章清單
district_badges / group_badges：逗號分隔的 full_title 字串。
五、修改時的注意事項
改任何「章比對」邏輯，一律以 full_title 為準，勿用 badge_code。
寫入 Examiners 的章名必須是 full_title，否則報考系統找不到該主考。
寫入 Examiners 的 unit 必須是「港島第XX旅」格式（用 normalizeUnit_）。
主考姓名在 Matrix / Examiners / Appointments 必須完全一致（含稱謂），否則同步會出現重複行。
動 sync 前，確認 Matrix 表頭已涵蓋所有 active 章（必要時先「重建 Matrix 表頭」）。
Apps Script 改完務必「管理部署 → 編輯 → 新版本 → 部署」才生效。
