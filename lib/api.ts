/**
 * API 呼叫封裝 (v2.0 - CORS Fix)
 * 使用 text/plain 避免觸發瀏覽器 CORS 預檢請求
 */
const API_BASE = 'https://script.google.com/macros/s/AKfycbwoPUw609tUygwm5RxRKTtCDiAnXjGikYdwJACcTPNoJvPGYz7PN2hfiFx9d74Vi4NK/exec';

// 🔧 統一改用 POST 請求 + text/plain 避開 CORS 預檢
async function callGAS(action: string, body?: any) {
  const payload = body ? JSON.stringify({ action, ...body }) : JSON.stringify({ action });
  
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // 👈 關鍵！用 text/plain 就不觸發 CORS
    body: payload
  });
  
  return res.json();
}

// 保留 GET 功能（GET 通常不會觸發 CORS 預檢）
async function fetchAPI(action: string, params?: Record<string, string>) {
  const url = new URL(API_BASE);
  url.searchParams.set('action', action);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  return res.json();
}

export const api = {
  // 公開查詢（GET）
  getStatus: (appId: string, ymNumber: string) => 
    fetchAPI('getStatus', { appId, ymNumber }),
  
  getPendingCertificates: () => 
    callGAS('getPendingCertificates'),
  
  getActiveExaminers: () => 
    callGAS('getActiveExaminers'),

  getBadgeCodes: () =>
    callGAS('getBadgeCodes'),

  getGroups: () =>
    callGAS('getGroups'),

  // 成員操作（POST）
  submitApplication: (data: any) => 
    callGAS('submitApplication', data),

  parentConfirm: (token: string) =>
    callGAS('parentConfirm', { token }),

  leaderConfirm: (token: string) => 
    callGAS('leaderConfirm', { token }),

  examinerSubmitResult: (token: string, result: string, remarks: string) => 
    callGAS('examinerSubmitResult', { token, result, remarks }),

  // 秘書後台
  adminGetPending: (staffToken: string) => 
    callGAS('adminGetPendingApplications', { staffToken }),
  
  adminGetDashboard: (staffToken: string) => 
    callGAS('adminGetDashboard', { staffToken }),
  
  districtApprove: (staffToken: string, applicationId: string, approvedBy?: string) =>
    callGAS('districtApprove', { staffToken, applicationId, approvedBy }),
  
  markCertificateReady: (staffToken: string, certificateId: string) =>
    callGAS('markCertificateReady', { staffToken, certificateId }),
  
  markCertificatePickedUp: (staffToken: string, certificateId: string, pickedUpBy?: string) =>
    callGAS('markCertificatePickedUp', { staffToken, certificateId, pickedUpBy }),
  
  getPrintList: (staffToken: string) =>
    callGAS('getPrintList', { staffToken }),
  
  reprintCertificate: (staffToken: string, applicationId: string) =>
    callGAS('reprintCertificate', { staffToken, applicationId }),

  // 主考申請
  submitExaminerApplication: (data: any) =>
    callGAS('submitExaminerApplication', data)
};

export { API_BASE };
