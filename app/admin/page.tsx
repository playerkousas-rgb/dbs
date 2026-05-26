'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'certificates' | 'printList'>('dashboard');
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<Record<string, number> | null>(null);
  const [printList, setPrintList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const login = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetDashboard(token);
      if (res.success) {
        setLoggedIn(true);
        setDashboard(res.stats || {});
      } else {
        setMessage('登入失敗：' + (res.error || '請檢查密鑰'));
      }
    } catch (e) {
      setMessage('網絡錯誤');
    }
    setLoading(false);
  };

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetPending(token);
      if (res.success) setPendingApps(res.applications || []);
      else setMessage('載入失敗');
    } catch (e) {
      setMessage('網絡錯誤');
    }
    setLoading(false);
  };

  const loadPrintList = async () => {
    setLoading(true);
    try {
      const res = await api.getPrintList(token);
      if (res.success) setPrintList(res.printList || []);
      else setMessage('載入失敗');
    } catch (e) {
      setMessage('網絡錯誤');
    }
    setLoading(false);
  };

  const approve = async (appId: string) => {
    setLoading(true);
    try {
      const res = await api.districtApprove(token, appId);
      if (res.success) {
        setMessage(`✅ 已批核 ${appId}` + (res.assignedExaminer ? `，指派主考：${res.assignedExaminer.name}` : ''));
        loadPending();
      } else {
        if (res.requiresManualOverride) {
          setMessage(`⚠️ ${appId}：${res.error}。${res.suggestion || ''}`);
        } else {
          setMessage('❌ 批核失敗：' + (res.error || '未知錯誤'));
        }
      }
    } catch (e) {
      setMessage('網絡錯誤');
    }
    setLoading(false);
  };

  if (!loggedIn) {
    return (
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ color: '#003366', marginTop: 0 }}>⚙️ 秘書後台登入</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
          請輸入系統管理密鑰
        </p>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="輸入 STAFF_TOKEN"
          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '16px' }}
        />
        <button 
          onClick={login} 
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#003366', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
        >
          {loading ? '驗證中...' : '登入'}
        </button>
        {message && <p style={{ color: '#c62828', marginTop: '12px', fontSize: '14px' }}>{message}</p>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#003366', margin: 0 }}>📊 秘書控制台</h2>
        <button onClick={() => { setLoggedIn(false); setToken(''); }} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          登出
        </button>
      </div>

      {message && (
        <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {message}
        </div>
      )}

      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <StatCard label="待團長確認" value={dashboard['待團長確認'] || 0} color="#ff9800" />
          <StatCard label="待區批核" value={dashboard['待區批核'] || 0} color="#f44336" />
          <StatCard label="已指派待接受" value={dashboard['已指派待主考接受'] || 0} color="#9c27b0" />
          <StatCard label="考核進行中" value={dashboard['已派主考進行中'] || 0} color="#2196f3" />
          <StatCard label="合格待製證書" value={dashboard['考驗合格待製證書'] || 0} color="#4caf50" />
          <StatCard label="待領取證書" value={dashboard['證書待領取'] || 0} color="#ff5722" />
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="總覽" />
        <TabButton active={activeTab === 'pending'} onClick={() => { setActiveTab('pending'); loadPending(); }} label="待批核申請" />
        <TabButton active={activeTab === 'printList'} onClick={() => { setActiveTab('printList'); loadPrintList(); }} label="列印清單" />
        <TabButton active={activeTab === 'certificates'} onClick={() => setActiveTab('certificates')} label="證書管理" />
      </div>

      {activeTab === 'pending' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#003366', marginTop: 0 }}>待批核申請列表</h3>
          {pendingApps.length === 0 ? (
            <p style={{ color: '#666' }}>目前沒有待批核的申請</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#003366', color: 'white' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>申請編號</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>考生</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>YMIS</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>旅團</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>專章</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>安排</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>狀態</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApps.map((app, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>{app.applicationId}</td>
                      <td style={{ padding: '10px' }}>{app.memberName}</td>
                      <td style={{ padding: '10px' }}>{app.ymNumber}</td>
                      <td style={{ padding: '10px' }}>{app.groupId}</td>
                      <td style={{ padding: '10px' }}>{app.badgeName}</td>
                      <td style={{ padding: '10px' }}>
                        {app.examArrangementType === 'SELF_APPLY' ? '自行報考' : 
                         app.examArrangementType === 'APPROVED_COURSE' ? '訓練班' :
                         app.examArrangementType === 'EXAM_DAY' ? '考驗日' :
                         app.examArrangementType === 'CERTIFICATE_EXCHANGE' ? '證書換領' : '其他'}
                      </td>
                      <td style={{ padding: '10px' }}>{app.status}</td>
                      <td style={{ padding: '10px' }}>
                        <button 
                          onClick={() => approve(app.applicationId)}
                          disabled={loading || app.status === '待團長確認'}
                          style={{ padding: '6px 16px', background: app.status === '待團長確認' ? '#ccc' : '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: app.status === '待團長確認' ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                        >
                          {app.status === '待團長確認' ? '待確認' : '一鍵批核'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'printList' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#003366', marginTop: 0 }}>🖨️ 證書列印清單</h3>
          {printList.length === 0 ? (
            <p style={{ color: '#666' }}>列印清單為空</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#003366', color: 'white' }}>
                    <th style={{ padding: '8px' }}>序</th>
                    <th style={{ padding: '8px' }}>考獲日期</th>
                    <th style={{ padding: '8px' }}>證書編號</th>
                    <th style={{ padding: '8px' }}>姓名</th>
                    <th style={{ padding: '8px' }}>旅團</th>
                    <th style={{ padding: '8px' }}>專章</th>
                    <th style={{ padding: '8px' }}>重印次數</th>
                  </tr>
                </thead>
                <tbody>
                  {printList.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '8px' }}>{item.seq}</td>
                      <td style={{ padding: '8px' }}>{item.resultDate}</td>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>{item.certNumber}</td>
                      <td style={{ padding: '8px' }}>{item.memberName}</td>
                      <td style={{ padding: '8px' }}>{item.groupNameCn}</td>
                      <td style={{ padding: '8px' }}>{item.fullTitle}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.reprintCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'certificates' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#003366', marginTop: 0 }}>🏆 證書管理</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            此頁面顯示「考核合格待製證書」及「已製作待領取」的證書。<br/>
            請於列印證書後，在 CertificateQueue 工作表標記「可領取」。
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${color}`, textAlign: 'center' }}>
      <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value || 0}</div>
      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: '6px',
        border: 'none',
        background: active ? '#003366' : '#e0e0e0',
        color: active ? 'white' : '#333',
        fontWeight: 600,
        cursor: 'pointer'
      }}
    >
      {label}
    </button>
  );
}