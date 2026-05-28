'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function LeaderConfirmInner() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const doConfirm = () => {
    if (!token) {
      setStatus('error');
      setMessage('連結缺少驗證碼，請重新從電郵點擊');
      return;
    }
    setStatus('loading');
    api.leaderConfirm(token)
      .then((res: any) => {
        if (res.success) {
          setStatus('success');
          setMessage(res.message || '已成功確認，申請已送往區會審批。');
          setConfirmed(true);
        } else {
          setStatus('error');
          setMessage(res.error || '確認失敗，請聯絡專章秘書 dbs@skwscout.org.hk');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('網絡錯誤，請稍後重試');
      });
  };

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('連結缺少驗證碼');
      return;
    }
    setStatus('success');
    setMessage('');
  }, [token]);

  if (confirmed) {
    return (
      <div style={{ background: 'white', padding: '40px 24px', borderRadius: '12px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <p style={{ fontSize: '48px', margin: '24px 0' }}>✅</p>
        <h3 style={{ color: '#2e7d32', marginBottom: '16px' }}>團長確認成功！</h3>
        <p style={{ color: '#333', lineHeight: '1.6' }}>{message}</p>
        <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '8px', margin: '24px 0', textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
            申請已送交區會專章秘書審批。<br/>
            審批通過後，系統會自動派發主考，並通知考生及主考。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', padding: '40px 24px', borderRadius: '12px', maxWidth: '600px', margin: '40px auto' }}>
      <h2 style={{ color: '#003366', marginBottom: '16px', textAlign: 'center' }}>團長確認</h2>

      {status === 'loading' && (
        <p style={{ textAlign: 'center', color: '#666' }}>⏳ 處理中...</p>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '48px', margin: '24px 0' }}>❌</p>
          <p style={{ color: '#c62828' }}>{message}</p>
        </div>
      )}

      {status === 'success' && !confirmed && (
        <div>
          <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
            <p style={{ margin: 0, color: '#333', lineHeight: '1.6' }}>
              貴團團員的專科徽章報考申請已通過家長同意，現需團長確認以送交區會審批。
            </p>
            <p style={{ margin: '12px 0 0', color: '#666', fontSize: '13px' }}>
              💡 此電郵確認等同團長簽署及蓋印。
            </p>
          </div>

          <div style={{ margin: '16px 0' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#333' }}>
              您的電郵（選填，方便紀錄）
            </label>
            <input
              type="email"
              value={leaderEmail}
              onChange={e => setLeaderEmail(e.target.value)}
              placeholder="leader@skwscout.org.hk"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
            />
          </div>

          <button
            onClick={doConfirm}
            style={{
              width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
              background: '#003366', color: 'white', fontWeight: 600, fontSize: '16px', cursor: 'pointer', marginTop: '8px'
            }}
          >
            ✅ 確認此申請，送交區會審批
          </button>
        </div>
      )}
    </div>
  );
}

export default function LeaderConfirmPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>載入中...</div>}>
      <LeaderConfirmInner />
    </Suspense>
  );
}
