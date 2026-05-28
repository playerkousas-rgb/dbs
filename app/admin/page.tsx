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

  const approve = async (appId: string, overrideExaminerId?: string, examinerName?: string) => {
    const app = pendingApps.find(a => a.applicationId === appId);
    const preview = app?.examinerPreview;

    let confirmMsg = `確定要批核 ${appId} 嗎？\n\n考生：${app?.memberName}\n專章：${app?.badgeName}\n`;
    if (overrideExaminerId && examinerName) {
      confirmMsg += `\n指派主考：${examinerName}（人手指派）`;
    } else if (preview?.mode === 'no_examiner') {
      confirmMsg += `\n${preview.label}（${preview.detail}）`;
    } else if (preview?.examinerId) {
      confirmMsg += `\n指派主考：${preview.label}\n${preview.detail}`;
    } else {
      confirmMsg += `\n⚠️ 注意：${preview?.label || ''} ${preview?.detail || ''}`;
    }
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await api.districtApprove(token, appId, '秘書後台', overrideExaminerId);
      if (res.success) {
        setMessage(`✅ 已批核 ${appId}` + (res.assignedExaminer ? `，指派主考：${res.assignedExaminer.name}` : ''));
        loadPending();
      } else {
        setMessage('❌ 批核失敗：' + (res.error || '未知錯誤'));
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
          <p style={{ color: '#666', fontSize: '13px', marginTop: 0 }}>
            💡 系統會預先計算每筆申請的主考分配建議，您可確認後批核，或改派其他主考。
          </p>
          {pendingApps.length === 0 ? (
            <p style={{ color: '#666' }}>目前沒有待批核的申請</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingApps.map((app, idx) => (
                <PendingCard
                  key={idx}
                  app={app}
                  onApprove={approve}
                  loading={loading}
                />
              ))}
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
                  {printList.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{p.seq}</td>
                      <td style={{ padding: '8px' }}>{p.resultDate}</td>
                      <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '11px' }}>{p.certNumber}</td>
                      <td style={{ padding: '8px' }}>{p.memberName}</td>
                      <td style={{ padding: '8px' }}>{p.groupNameCn}</td>
                      <td style={{ padding: '8px' }}>{p.badgeName}</td>
                      <td style={{ padding: '8px' }}>{p.category}</td>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>{p.badgeCode}</td>
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
            資料來源：ExaminerMatrix → Examiners（自動同步）。<strong style={{ color: '#1565c0' }}>D</strong> = 區主考（接受區內所有旅團），
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
                '主考名單：ExaminerMatrix → Examiners',
                '旅團資料：Groups 工作表',
                '申請紀錄：Applications 工作表'
              ]}
            />
            <InfoCard
              title="更新方式"
              items={[
                '更新專章代碼：直接編輯 BadgeCodes Sheet',
                '更新主考資格：直接編輯 ExaminerMatrix Sheet',
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

// ============================================================
// 待批核卡片（含主考預覽 + 改派功能）
// ============================================================
function PendingCard({ app, onApprove, loading }: { app: any; onApprove: (id: string, overrideId?: string, name?: string) => void; loading: boolean }) {
  const [overrideMode, setOverrideMode] = useState(false);
  const [selectedExaminerId, setSelectedExaminerId] = useState('');
  const [allExaminers, setAllExaminers] = useState<any[]>([]);

  const preview = app.examinerPreview || {};
  const isWaiting = app.status === '待家長確認' || app.status === '待團長確認';

  const loadAllExaminers = async () => {
    if (allExaminers.length > 0) return;
    const res = await api.getActiveExaminers();
    if (res.success) setAllExaminers(res.examiners || []);
  };

  const eligibleExaminers = allExaminers.filter((ex: any) =>
    ex.qualifiedBadges?.some((qb: any) => qb.badgeName === app.badgeName)
  );

  const previewColor =
    preview.severity === 'error' ? '#c62828' :
    preview.severity === 'warn'  ? '#e65100' :
    preview.valid                ? '#2e7d32' : '#666';

  const previewBg =
    preview.severity === 'error' ? '#ffebee' :
    preview.severity === 'warn'  ? '#fff3e0' :
    preview.valid                ? '#e8f5e9' : '#f5f5f5';

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
            <code style={{ background: '#003366', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
              {app.applicationId}
            </code>
            <span style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
              background: app.status === '待團長確認' ? '#fff3e0' : '#e8f5e9',
              color: app.status === '待團長確認' ? '#e65100' : '#2e7d32'
            }}>
              {app.status}
            </span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#003366' }}>
            {app.memberName} <span style={{ color: '#999', fontWeight: 400, fontSize: '13px' }}>({app.ymNumber})</span>
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            🏕️ {app.groupId} · 🎖️ <strong>{app.badgeName}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            安排：{app.examArrangementType === 'SELF_APPLY' ? '自行報考' :
                  app.examArrangementType === 'APPROVED_COURSE' ? '訓練班' :
                  app.examArrangementType === 'EXAM_DAY' ? '考驗日' :
                  app.examArrangementType === 'CERTIFICATE_EXCHANGE' ? '證書換領' : '其他'}
            {app.selfExaminerName ? ` · 申請時選：${app.selfExaminerName}` : ''}
          </div>
        </div>

        <div style={{ background: previewBg, padding: '10px', borderRadius: '6px', border: `1px solid ${previewColor}` }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>建議主考</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: previewColor }}>
            {preview.label || '—'}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            {preview.detail || ''}
          </div>
        </div>
      </div>

      {overrideMode && !isWaiting && (
        <div style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '10px' }}>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>
            選擇其他主考（共 {eligibleExaminers.length} 位合資格）
          </label>
          <select
            value={selectedExaminerId}
            onChange={e => setSelectedExaminerId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
          >
            <option value="">-- 請選擇 --</option>
            {eligibleExaminers.map((ex: any) => {
              const qb = ex.qualifiedBadges?.find((q: any) => q.badgeName === app.badgeName);
              return (
                <option key={ex.examinerId} value={ex.examinerId}>
                  {ex.name} ({qb?.scope || '?'} 主考) · 負荷 {ex.currentLoad}/{ex.maxLoad} {ex.unit ? `· ${ex.unit}` : ''}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {isWaiting ? (
          <span style={{ color: '#999', fontSize: '13px', alignSelf: 'center' }}>
            ⏳ 等待 {app.status === '待家長確認' ? '家長' : '團長'} 確認中
          </span>
        ) : (
          <>
            {!overrideMode && preview.mode !== 'no_examiner' && (
              <button
                onClick={() => { setOverrideMode(true); loadAllExaminers(); }}
                disabled={loading}
                style={{
                  padding: '8px 14px', background: 'white', color: '#003366',
                  border: '1px solid #003366', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                }}
              >
                🔄 改派其他主考
              </button>
            )}
            {overrideMode && (
              <>
                <button
                  onClick={() => { setOverrideMode(false); setSelectedExaminerId(''); }}
                  disabled={loading}
                  style={{
                    padding: '8px 14px', background: '#999', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                  }}
                >
                  取消改派
                </button>
                <button
                  onClick={() => {
                    if (!selectedExaminerId) { alert('請選擇主考'); return; }
                    const ex = eligibleExaminers.find((e: any) => e.examinerId === selectedExaminerId);
                    onApprove(app.applicationId, selectedExaminerId, ex?.name);
                  }}
                  disabled={loading || !selectedExaminerId}
                  style={{
                    padding: '8px 14px', background: selectedExaminerId ? '#1565c0' : '#ccc',
                    color: 'white', border: 'none', borderRadius: '4px',
                    cursor: selectedExaminerId ? 'pointer' : 'not-allowed', fontSize: '13px'
                  }}
                >
                  ✅ 用選定主考批核
                </button>
              </>
            )}
            {!overrideMode && (
              <button
                onClick={() => onApprove(app.applicationId)}
                disabled={loading || !preview.valid}
                style={{
                  padding: '8px 16px',
                  background: preview.valid ? '#4caf50' : '#ccc',
                  color: 'white', border: 'none', borderRadius: '4px',
                  cursor: preview.valid ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 600
                }}
                title={!preview.valid ? '主考無效，請改派' : ''}
              >
                {preview.mode === 'no_examiner' ? '✅ 批核（不需主考）' : '✅ 確認批核'}
              </button>
            )}
          </>
        )}
      </div>
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
