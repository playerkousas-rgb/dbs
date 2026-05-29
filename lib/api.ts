/**
 * API 呼叫封裝 (v3.10 - 修復 CertificateQueue / CertificatePrintList 同步)
 *
 * 修復內容：
 * 1. recordPrintAction() — 接受完整 certData，傳給後端更新 CertificateQueue
 * 2. syncCertificatePrintList() — 接受完整 certData，傳給後端寫入 CertificatePrintList
 * 3. 確保 print-cert/[id] 和 examiner 頁面傳遞的資料能到達後端
 */

const API_BASE = 'https://script.google.com/macros/s/AKfycbyfZC3g9h19ybPbMSKxL6s1M5hBZLHOXH7BEJ3zXhqtM2jAqwZkQZJ8aT5mTwG0Qr8/exec';

async function callGet(action: string, params?: Record<string, string>) {
  const url = new URL(API_BASE);
  url.searchParams.set('action', action);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  try {
    const res = await fetch(url.toString());
    return res.json();
  } catch (error) {
    console.error("GET Error:", error);
    throw error;
  }
}

async function callPost(action: string, body: any) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...body })
    });
    return res.json();
  } catch (error) {
    console.error("POST Error:", error);
    throw error;
  }
}

export const api = {
  // === GET ===
  getStatus: (appId: string, ymNumber: string) =>
    callGet('getStatus', { appId, ymNumber }),

  getPendingCertificates: () =>
    callGet('getPendingCertificates'),

  getActiveExaminers: () =>
    callGet('getActiveExaminers'),

  getBadgeCodes: () =>
    callGet('getBadgeCodes'),

  getGroups: () =>
    callGet('getGroups'),

  // === POST 寫入 ===
  submitApplication: (data: any) =>
    callPost('submitApplication', data),

  parentConfirm: (token: string) =>
    callPost('parentConfirm', { token }),

  leaderConfirm: (token: string) =>
    callPost('leaderConfirm', { token }),

  examinerAccept: (token: string) =>
    callPost('examinerAccept', { token }),

  examinerDecline: (token: string, reason: string) =>
    callPost('examinerDecline', { token, reason }),

  examinerSubmitResult: (token: string, result: string, remarks: string) =>
    callPost('examinerSubmitResult', { token, result, remarks }),

  // === 秘書後台 ===
  adminGetPending: (staffToken: string) =>
    callPost('adminGetPendingApplications', { staffToken }),

  adminGetDashboard: (staffToken: string) =>
    callPost('adminGetDashboard', { staffToken }),

  districtApprove: (staffToken: string, applicationId: string, approvedBy?: string, overrideExaminerId?: string) =>
    callPost('districtApprove', { staffToken, applicationId, approvedBy, overrideExaminerId }),

  // ★ 證書管理（新版）
  adminGetCertificates: (staffToken: string, status?: string) =>
    callPost('adminGetCertificates', { staffToken, status }),

  getCertificate: (certificateId: string, staffToken: string) =>
    callPost('getCertificate', { certificateId, staffToken }),

  markCertificateReady: (staffToken: string, certificateId: string) =>
    callPost('markCertificateReady', { staffToken, certificateId }),

  markCertificatePickedUp: (staffToken: string, certificateId: string, pickedUpBy?: string) =>
    callPost('markCertificatePickedUp', { staffToken, certificateId, pickedUpBy }),

  getPrintList: (staffToken: string) =>
    callPost('getPrintList', { staffToken }),

  reprintCertificate: (staffToken: string, applicationId: string) =>
    callPost('reprintCertificate', { staffToken, applicationId }),

  submitExaminerApplication: (data: any) =>
    callPost('submitExaminerApplication', data),

  // ★★★ v3.10 修復：列印記錄同步（可接收完整證書資料）★★★
  /**
   * 記錄列印動作 → 更新 CertificateQueue
   * @param staffToken - 管理密鑰
   * @param certificateId - 證書 ID
   * @param certData - (可選) 完整證書資料 { memberName, badgeName, groupId, applicationId, certificateNumber, resultDate, ... }
   *                   後端收到後寫入 CertificateQueue 對應欄位
   */
  recordPrintAction: (staffToken: string, certificateId: string, certData?: any) =>
    callPost('recordPrintAction', {
      staffToken,
      certificateId,
      certData: certData || {}
    }),

  /**
   * 同步 CertificatePrintList（確保列印清單有完整資料）
   * @param staffToken - 管理密鑰（可傳空字串，由後端判斷權限）
   * @param applicationId - 申請編號
   * @param certData - (可選) 完整證書資料 { memberName, memberNameEn, groupId, groupNameCn,
   *                   badgeName, badgeNameEn, badgeCode, category, certificateNumber, resultDate }
   *                   後端收到後寫入 CertificatePrintList
   */
  syncCertificatePrintList: (staffToken: string, applicationId: string, certData?: any) =>
    callPost('syncCertificatePrintList', {
      staffToken,
      applicationId,
      certData: certData || {}
    }),
};

export { API_BASE };
