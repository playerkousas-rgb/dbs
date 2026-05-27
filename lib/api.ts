/**
 * API 呼叫封裝 (v3.0 - 強制 POST 版)
 * 為了徹底解決 CORS 問題，所有請求統一走 POST 通道
 */
const API_BASE = 'https://script.google.com/macros/s/AKfycbwoPUw609tUygwm5RxRKTtCDiAnXjGikYdwJACcTPNoJvPGYz7PN2hfiFx9d74Vi4NK/exec';

// 統一發送函數：POST + text/plain
async function callGAS(action: string, body: any = {}) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      // 👇 關鍵：使用 text/plain 避開瀏覽器預檢 (Preflight)
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...body })
    });

    // 如果回應不是 JSON (例如 500 錯誤頁)，這裡會報錯，讓我們知道
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    } else {
      const text = await response.text();
      throw new Error("伺服器返回了非 JSON 格式: " + text.substring(0, 100));
    }
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    throw error;
  }
}

export const api = {
  // === 讀取 (改用 callGAS) ===
  getStatus: (appId: string, ymNumber: string) => 
    callGAS('getStatus', { appId, ymNumber }),
  
  getPendingCertificates: () => 
    callGAS('getPendingCertificates'),
  
  getActiveExaminers: () => 
    callGAS('getActiveExaminers'),

  getBadgeCodes: () =>
    callGAS('getBadgeCodes'),

  getGroups: () =>
    callGAS('getGroups'),

  // === 寫入 (改用 callGAS) ===
  submitApplication: (data: any) => 
    callGAS('submitApplication', data),

  parentConfirm: (token: string) =>
    callGAS('parentConfirm', { token }),

  leaderConfirm: (token: string) => 
    callGAS('leaderConfirm', { token }),

  examinerSubmitResult: (token: string, result: string, remarks: string) => 
    callGAS('examinerSubmitResult', { token, result, remarks }),

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

  submitExaminerApplication: (data: any) =>
    callGAS('submitExaminerApplication', data)
};

export { API_BASE };
