/**
 * API 呼叫封裝 (v2.1 - Hybrid CORS Fix)
 * 讀取操作使用 GET (避免後端邏輯缺失)，寫入操作使用 POST (配合 text/plain 繞過 CORS)
 */
const API_BASE = 'https://script.google.com/macros/s/AKfycbwoPUw609tUygwm5RxRKTtCDiAnXjGikYdwJACcTPNoJvPGYz7PN2hfiFx9d74Vi4NK/exec';

// 1. GET 請求：用於「讀取」資料 (通常不會觸發 CORS 預檢)
async function fetchGet(action: string, params?: Record<string, string>) {
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

// 2. POST 請求：用於「寫入/修改」資料 (必須用 text/plain 避開 CORS)
async function fetchPost(action: string, body: any) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // 👈 關鍵：用純文本避開 CORS 預檢
      body: JSON.stringify({ action, ...body })
    });
    return res.json();
  } catch (error) {
    console.error("POST Error:", error);
    throw error;
  }
}

export const api = {
  // ==========================================
  // 📖 讀取操作 (使用 GET - 穩定且快速)
  // ==========================================
  
  getStatus: (appId: string, ymNumber: string) => 
    fetchGet('getStatus', { appId, ymNumber }),
  
  getPendingCertificates: () => 
    fetchGet('getPendingCertificates'),
  
  getActiveExaminers: () => 
    fetchGet('getActiveExaminers'), // 👈 恢復用 GET，這裡不會掛掉

  getBadgeCodes: () =>
    fetchGet('getBadgeCodes'),     // 👈 恢復用 GET

  getGroups: () =>
    fetchGet('getGroups'),         // 👈 恢復用 GET

  // ==========================================
  // ✍️ 寫入操作 (使用 POST - 避開 CORS)
  // ==========================================

  submitApplication: (data: any) => 
    fetchPost('submitApplication', data),

  parentConfirm: (token: string) =>
    fetchPost('parentConfirm', { token }),

  leaderConfirm: (token: string) => 
    fetchPost('leaderConfirm', { token }),

  examinerSubmitResult: (token: string, result: string, remarks: string) => 
    fetchPost('examinerSubmitResult', { token, result, remarks }),

  adminGetPending: (staffToken: string) => 
    fetchPost('adminGetPendingApplications', { staffToken }),
  
  adminGetDashboard: (staffToken: string) => 
    fetchPost('adminGetDashboard', { staffToken }),
  
  districtApprove: (staffToken: string, applicationId: string, approvedBy?: string) =>
    fetchPost('districtApprove', { staffToken, applicationId, approvedBy }),
  
  markCertificateReady: (staffToken: string, certificateId: string) =>
    fetchPost('markCertificateReady', { staffToken, certificateId }),
  
  markCertificatePickedUp: (staffToken: string, certificateId: string, pickedUpBy?: string) =>
    fetchPost('markCertificatePickedUp', { staffToken, certificateId, pickedUpBy }),
  
  getPrintList: (staffToken: string) =>
    fetchPost('getPrintList', { staffToken }),
  
  reprintCertificate: (staffToken: string, applicationId: string) =>
    fetchPost('reprintCertificate', { staffToken, applicationId }),

  submitExaminerApplication: (data: any) =>
    fetchPost('submitExaminerApplication', data)
};

export { API_BASE };
