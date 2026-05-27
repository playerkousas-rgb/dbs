'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'certificates' | 'printList' | 'examiners' | 'badges'>('dashboard');
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<Record<string, number> | null>(null);
  const [printList, setPrintList] = useState<any[]>([]);
  const [examiners, setExaminers] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
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

  const loadExaminers = async () => {
    setLoading(true);
    try {
      const res = await api.getActiveExaminers();
      if (res.success) setExaminers(res.examiners || []);
      else setMessage('載入失敗');
    } catch (e) {
      setMessage('網絡錯誤');
    }
    setLoading(false);
  };

  const loadBadges = async () => {
    setLoading(true);
    try {
      const res = await api.getBadgeCodes();
      if (res.success) setBadges(res.badges || []);
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
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="輸入 STAFF_TOKEN"
          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '16px', boxSizing: 'border-box' }}
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
          <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>
      )}

      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <StatCard label="待家長確認" value={dashboard['待家長確認'] || 0} color="#e91e63" />
          <StatCard label="待團長確認" value={dashboard['待團長確認'] || 0} color="#ff9800" />
          <StatCard label="待區批核" value={dashboard['待區批核'] || 0} color="#f44336" />
          <StatCard label="已指派待接受" value={dashboard['已指派待主考接受'] || 0} color="#9c27b0" />
          <StatCard label="考核進行中" value={dashboard['已派主考進行中'] || 0} color="#2196f3" />
          <StatCard label="合格待製證書" value={dashboard['考驗合格待製證書'] || 0} color="#4caf50" />
          <StatCard label="待領取證書" value={dashboard['證書待領取'] || 0} color="#ff5722" />
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="總覽" />
        <TabButton active={activeTab === 'pending'} onClick={() => { setActiveTab('pending'); loadPending(); }} label="待批核" />
        <TabButton active={activeTab === 'printList'} onClick={() => { setActiveTab('printList'); loadPrintList(); }} label="列印" />
        <TabButton active={activeTab === 'certificates'} onClick={() => setActiveTab('certificates')} label="證書" />
        <TabButton active={activeTab === 'examiners'} onClick={() => { setActiveTab('examiners'); loadExaminers(); }} label="主考名單" />
        <TabButton active={activeTab === 'badges'} onClick={() => { setActiveTab('badges'); loadBadges(); }} label="專章代碼" />
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
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                          background: app.status === '待團長確認' ? '#fff3e0' : '#e8f5e9',
                          color: app.status === '待團長確認' ? '#e65100' : '#2e7d32'
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button 
                          onClick={() => approve(app.applicationId)}
                          disabled={loading || app.status === '待家長確認' || app.status === '待團長確認'}
                          style={{ padding: '6px 16px', background: (app.status === '待家長確認' || app.status === '待團長確認') ? '#ccc' : '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: (app.status === '待家長確認' || app.status === '待團長確認') ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                        >
                          {app.status === '待家長確認' ? '待家長' : status === '待團長確認' ? '待團長' : '一鍵批核'}
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
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            此清單的資料可用於 Word 合併列印。證書模版根據專章類別自動匹配。
          </p>
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
                    <th style={{ padding: '8px' }}>類別</th>
                    <th style={{ padding: '8px' }}>代碼</th>
                  </tr>
                </thead>
                <tbody>
                  {printList.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '8px' }}>{idx + 1}</td>
                      <td style={{ padding: '8px' }}>{item.resultDate || item.result_date || '—'}</td>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>{item.certNumber || item.certificate_number || '—'}</td>
                      <td style={{ padding: '8px' }}>{item.memberName || item.member_name || '—'}</td>
                      <td style={{ padding: '8px' }}>{item.groupNameCn || item.group_name || '—'}</td>
                      <td style={{ padding: '8px' }}>{item.fullTitle || item.badge_name || '—'}</td>
                      <td style={{ padding: '8px' }}>{item.category || '—'}</td>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>{item.badgeCode || item.badge_code || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'examiners' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#003366', marginTop: 0 }}>👨‍🏫 主考名單（動態讀取）</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            資料來源：主考名冊 Excel 檔案。<strong style={{ color: '#1565c0' }}>D</strong> = 區主考（接受區內所有旅團），
            <strong style={{ color: '#e65100' }}>G</strong> = 旅團主考（只限本旅團）。
          </p>
          
          {examiners.length === 0 ? (
            <p style={{ color: '#666' }}>載入中或沒有主考資料...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#003366', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>姓名</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>單位</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>區主考 (D) 專章</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>旅團主考 (G) 專章</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>總計</th>
                  </tr>
                </thead>
                <tbody>
                  {examiners.map((ex, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{ex.name}</td>
                      <td style={{ padding: '8px' }}>{ex.unit || '—'}</td>
                      <td style={{ padding: '8px' }}>
                        {ex.districtBadges.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {ex.districtBadges.map((b: string, bi: number) => (
                              <span key={bi} style={{ 
                                display: 'inline-block', padding: '1px 6px', borderRadius: '3px',
                                fontSize: '11px', background: '#e3f2fd', color: '#1565c0'
                              }}>
                                {b}
                              </span>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '8px' }}>
                        {ex.groupBadges.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {ex.groupBadges.map((b: string, bi: number) => (
                              <span key={bi} style={{ 
                                display: 'inline-block', padding: '1px 6px', borderRadius: '3px',
                                fontSize: '11px', background: '#fff3e0', color: '#e65100'
                              }}>
                                {b}
                              </span>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>
                        {ex.totalBadgeCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#003366', marginTop: 0 }}>🎖️ 專章代碼表（動態讀取自 BadgeCodes 工作表）</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            直接從 Google Sheet 的 BadgeCodes 分頁讀取。更新 Sheet 後此頁面會自動反映更改，無需改程式碼。
          </p>
          
          {badges.length === 0 ? (
            <p style={{ color: '#666' }}>載入中或沒有專章資料...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#003366', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>代碼</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>中文名稱</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>英文名稱</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>類別</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>完整名稱</th>
                  </tr>
                </thead>
                <tbody>
                  {badges.map((b, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 600 }}>{b.badgeCode}</td>
                      <td style={{ padding: '8px' }}>{b.badgeName}</td>
                      <td style={{ padding: '8px', color: '#666' }}>{b.badgeNameEn}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                          background: b.category === '興趣' ? '#e8f5e9' : 
                                     b.category === '技能' ? '#e3f2fd' :
                                     b.category === '服務' ? '#fff3e0' :
                                     b.category === '教導' ? '#f3e5f5' : '#f5f5f5',
                          color: b.category === '興趣' ? '#2e7d32' :
                                 b.category === '技能' ? '#1565c0' :
                                 b.category === '服務' ? '#e65100' :
                                 b.category === '教導' ? '#7b1fa2' : '#666'
                        }}>
                          {b.category || '其他'}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>{b.fullTitle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                共 {badges.length} 個有效專章
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'certificates' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#003366', marginTop: 0 }}>🏆 證書管理</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            此頁面顯示「考核合格待製證書」及「已製作待領取」的證書。
          </p>
          
          <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px', color: '#003366' }}>📋 證書模版說明</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#333' }}>
              <li><strong>興趣/技能/服務/教導</strong>：使用同一種 Word 合併列印模版</li>
              <li><strong>其他特殊章</strong>（社區參與、航空、海事等）：使用各自的專屬模版</li>
              <li>證書編號格式：<code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>[Badge Code]/HKIR/[Year]/SKW/[Seq]</code></li>
            </ul>
          </div>

          <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px', color: '#e65100' }}>⚠️ 操作提示</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              製作證書後，請於 Google Sheet 的 <strong>CertificateQueue</strong> 工作表將狀態從「待製作」改為「待領取」。
              系統將自動通知考生。
            </p>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#003366', marginTop: 0 }}>📈 系統概覽</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <InfoCard 
              title="資料來源" 
              items={[
                '專章代碼：BadgeCodes 工作表（動態讀取）',
                '主考名單：獨立 Excel 檔案（動態讀取）',
                '旅團資料：Groups 工作表',
                '申請紀錄：Applications 工作表'
              ]} 
            />
            <InfoCard 
              title="更新方式" 
              items={[
                '更新專章代碼：直接編輯 BadgeCodes Sheet',
                '更新主考資格：直接編輯主考 Excel 檔案',
                '更新旅團資料：直接編輯 Groups Sheet',
                '無需修改程式碼，前端自動反映'
              ]} 
            />
          </div>
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
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        background: active ? '#003366' : '#e0e0e0',
        color: active ? 'white' : '#333',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '13px'
      }}
    >
      {label}
    </button>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 8px', color: '#003366', fontSize: '14px' }}>{title}</h4>
      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
        {items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
