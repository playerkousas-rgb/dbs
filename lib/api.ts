/**
 * API 呼叫封裝 (v3.1 - Clean & Fixed)
 * 修正了語法錯誤，確保所有請求使用 POST + text/plain 避開 CORS
 */

// 👇 這裡的網址必須是純文字，不能有 []() 符號
const API_BASE = 'https://script.google.com/macros/s/AKfycbwoPUw609tUygwm5RxRKTtCDiAnXjGikYdwJACcTPNoJvPGYz7PN2hfiFx9d74Vi4NK/exec';

// 統一發送函數
async function callGAS(action: string, body: any = {}) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      // 👇 關鍵：使用 text/plain 讓瀏覽器不發送 OPTIONS 預檢請求
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...body })
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      // 如果腳本崩潰，會返回 HTML，這裡會捕捉到並顯示錯誤
      const text = await response.text();
      throw new Error("伺服器返回了非 JSON 格式 (可能是腳本崩潰): " + text.substring(0, 150));
    }
  } catch (error) {
    console.error("API Error (" + action + "):", error);
    throw error;
  }
}

export const api = {
  // 全部使用 callGAS (即 POST 請求)
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
