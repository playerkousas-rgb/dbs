'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function StatusContent() {
  const searchParams = useSearchParams();
  const prefillAppId = searchParams.get('appId') || '';
  
  const [appId, setAppId] = useState(prefillAppId);
  const [ymNumber, setYmNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !ymNumber) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getStatus(appId, ymNumber);
      if (res.success) {
        setResult(res);
      } else {
        setError(res.error || '查詢失敗');
        setResult(null);
      }
    } catch (err) {
      setError('網絡錯誤，請稍後重試');
    }
    setLoading(false);
  };

  const statusFlow = [
    { key: 'PENDING_LEADER', label: '待團長確認', icon: '👤' },
    { key: 'PENDING_DISTRICT', label: '待區批核', icon: '🏛️' },
    { key: 'PENDING_EXAMINER_ACCEPT', label: '已指派待主考接受', icon: '⏳' },
    { key: 'ASSIGNED_EXAMINER', label: '已派主考進行中', icon: '📝' },
    { key: 'EXAM_COMPLETED_PASS', label: '考驗合格待製證書', icon: '✅' },
    { key: 'CERTIFICATE_READY', label: '證書待領取', icon: '🏆' },
    { key: 'COMPLETED', label: '已完成', icon: '🎉' }
  ];

  const statusMap: Record<string, string> = {
    '待團長確認': 'PENDING_LEADER',
    '待區批核': 'PENDING_DISTRICT',
    '已指派待主考接受': 'PENDING_EXAMINER_ACCEPT',
    '已派主考進行中': 'ASSIGNED_EXAMINER',
    '考驗合格待製證書': 'EXAM_COMPLETED_PASS',
    '證書待領取': 'CERTIFICATE_READY',
    '已完成': 'COMPLETED',
    '不合格': 'EXAM_COMPLETED_FAIL',
    '逾期不合格': 'EXPIRED'
  };

  const getCurrentStep = (status: string) => {
    const mapped = statusMap[status] || status;
    const idx = statusFlow.findIndex(s => s.key === mapped);
    return idx >= 0 ? idx : statusFlow.length;
  };

  return (
    <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
      <h2 style={{ color: '#003366', marginTop: 0 }}>🔍 報考進度查詢</h2>
      
      <form onSubmit={handleQuery} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>申請編號 *</label>
            <input 
              value={appId} 
              onChange={e => setAppId(e.target.value.toUpperCase())}
              placeholder="例如：SKW-250520-0001"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>童軍成員編號(YMIS) *</label>
            <input 
              value={ymNumber} 
              onChange={e => setYmNumber(e.target.value)}
              placeholder="YMIS 編號"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '12px 24px', background: loading ? '#ccc' : '#003366',
              color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '查詢中...' : '查詢'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {result && (
        <div>
          <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#003366' }}>{result.memberName} · {result.badgeName}</h3>
            <p style={{ margin: '4px 0', color: '#666' }}>申請編號：<strong>{result.applicationId}</strong></p>
            <p style={{ margin: '4px 0', color: '#666' }}>YMIS：{result.ymNumber}</p>
            <p style={{ margin: '4px 0', color: '#666' }}>所屬旅團：{result.groupId}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#003366', marginBottom: '16px' }}>進度追蹤</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {statusFlow.map((step, idx) => {
                const currentStep = getCurrentStep(result.status);
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                const isFailed = (result.status === '不合格' || result.status === '逾期不合格') && idx >= 4;
                
                return (
                  <div key={step.key} style={{
                    display: 'flex', alignItems: 'center', padding: '12px 16px',
                    background: isActive ? '#e8f5e9' : isCompleted ? '#f5f5f5' : 'white',
                    borderLeft: isActive ? '4px solid #2e7d32' : isCompleted ? '4px solid #bdbdbd' : '4px solid transparent',
                    opacity: idx > currentStep && !isFailed ? 0.5 : 1
                  }}>
                    <span style={{ fontSize: '20px', marginRight: '12px' }}>
                      {isFailed && idx === 4 ? '❌' : isCompleted ? '✓' : isActive ? '▶' : '○'}
                    </span>
                    <span style={{ fontWeight: isActive ? 700 : 400, color: isActive ? '#2e7d32' : '#333' }}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>
                        目前狀態
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {result.result && (
            <div style={{ background: result.result === 'PASS' ? '#e8f5e9' : '#ffebee', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <strong>考核結果：</strong>{result.result === 'PASS' ? '合格 ✓' : '不合格 ✗'}
            </div>
          )}

          {result.certificateNumber && (
            <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <strong>證書編號：</strong>{result.certificateNumber}
              <br/>
              {result.pickedUpAt ? `已於 ${result.pickedUpAt.split('T')[0]} 領取` : '尚未領取'}
            </div>
          )}

          <div style={{ fontSize: '13px', color: '#666', marginTop: '16px' }}>
            <p>提交時間：{result.submittedAt ? result.submittedAt.replace('T', ' ').slice(0, 16) : '—'}</p>
            {result.leaderConfirmedAt && <p>團長確認：{result.leaderConfirmedAt.replace('T', ' ').slice(0, 16)}</p>}
            {result.districtApprovedAt && <p>區會批核：{result.districtApprovedAt.replace('T', ' ').slice(0, 16)}</p>}
            {result.examDeadline && <p>考核限期：{result.examDeadline}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>載入中...</div>}>
      <StatusContent />
    </Suspense>
  );
}