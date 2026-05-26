/**
 * API 呼叫封裝
 * 請將 API_BASE 替換為部署後的 Apps Script Web App URL
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

async function fetchAPI(action: string, params?: Record<string, string>) {
  const url = new URL(API_BASE);
  url.searchParams.set('action', action);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  return res.json();
}

async function postAPI(action: string, body: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body })
  });
  return res.json();
}

export const api = {
  // 公開查詢
  getStatus: (appId: string, phoneLast4: string) => 
    fetchAPI('getStatus', { appId, phoneLast4 }),
  
  getPendingCertificates: () => 
    fetchAPI('getPendingCertificates'),
  
  getActiveExaminers: () => 
    fetchAPI('getActiveExaminers'),

  // 成員操作
  submitApplication: (data: any) => 
    postAPI('submitApplication', data),

  // 團長確認
  leaderConfirm: (token: string) => 
    postAPI('leaderConfirm', { token }),

  // 主考回報
  examinerSubmitResult: (token: string, result: string, remarks: string) => 
    postAPI('examinerSubmitResult', { token, result, remarks }),

  // 秘書後台（需 staffToken）
  adminGetPending: (staffToken: string) => 
    postAPI('adminGetPendingApplications', { staffToken }),
  
  adminGetDashboard: (staffToken: string) => 
    postAPI('adminGetDashboard', { staffToken }),
  
  districtApprove: (staffToken: string, applicationId: string, approvedBy?: string) =>
    postAPI('districtApprove', { staffToken, applicationId, approvedBy }),
  
  markCertificateReady: (staffToken: string, certificateId: string) =>
    postAPI('markCertificateReady', { staffToken, certificateId }),
  
  markCertificatePickedUp: (staffToken: string, certificateId: string, pickedUpBy?: string) =>
    postAPI('markCertificatePickedUp', { staffToken, certificateId, pickedUpBy })
};

export { API_BASE };