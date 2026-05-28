/**
 * API 呼叫封裝 (v3.6 - Email links to frontend)
 * 讀取用 GET (穩定)，寫入用 POST (避開 CORS)
 */

// 👇 你的 Web App URL
const API_BASE = 'https://script.google.com/macros/s/AKfycbyfZC3g9h19ybPbMSKxL6s1M5hBZLHOXH7BEJ3zXhqtM2jAqwZkQZJ8aT5mTwG0Qr8/exec';

// 1. GET 請求：用於讀取資料
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

// 2. POST 請求：用於提交資料
async function callPost(action: string, body: any) {
  try {
    // 👇 使用 text/plain 是解決 Google CORS 的關鍵
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
  // === 讀取操作 (GET) ===
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

  // === 寫入操作 (POST) ===
  submitApplication: (data: any) =>
    callPost('submitApplication', data),

  // 確認流程（Email 連結 → 前端頁 → 這幾個 API）
  parentConfirm: (token: string) =>
    callPost('parentConfirm', { token }),

  leaderConfirm: (token: string) =>
    callPost('leaderConfirm', { token }),

  // 主考接受 / 拒絕 / 提交成績
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

  districtApprove: (staffToken: string, applicationId: string, approvedBy?: string) =>
    callPost('districtApprove', { staffToken, applicationId, approvedBy }),

  markCertificateReady: (staffToken: string, certificateId: string) =>
    callPost('markCertificateReady', { staffToken, certificateId }),

  markCertificatePickedUp: (staffToken: string, certificateId: string, pickedUpBy?: string) =>
    callPost('markCertificatePickedUp', { staffToken, certificateId, pickedUpBy }),

  getPrintList: (staffToken: string) =>
    callPost('getPrintList', { staffToken }),

  reprintCertificate: (staffToken: string, applicationId: string) =>
    callPost('reprintCertificate', { staffToken, applicationId }),

  // === 主考申請 ===
  submitExaminerApplication: (data: any) =>
    callPost('submitExaminerApplication', data)
};

export { API_BASE };
