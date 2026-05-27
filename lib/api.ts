/**
 * API 呼叫封裝 (v2.2 - Ultimate CORS Fix)
 * 所有請求統一使用 POST + text/plain 避開 CORS 攔截
 */
const API_BASE = 'https://script.google.com/macros/s/AKfycbwoPUw609tUygwm5RxRKTtCDiAnXjGikYdwJACcTPNoJvPGYz7PN2hfiFx9d74Vi4NK/exec';

// 🔧 統一發送函數
async function callGAS(action: string, body: any = {}) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      // 👇 關鍵：使用 text/plain 讓瀏覽器不發送 OPTIONS 預檢請求
      headers: { 'Content-Type': 'text/plain' }, 
      body: JSON.stringify({ action, ...body })
    });
    return res.json();
  } catch (error) {
    console.error(`GAS API Error (${action}):`, error);
    throw error;
  }
}

export const api = {
  // 👇 全部統一用 callGAS，不分 GET/POST
  
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
