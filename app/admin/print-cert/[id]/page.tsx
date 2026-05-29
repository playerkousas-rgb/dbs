'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CertStandard } from '@/components/cert/CertStandard';
import { CertReligious } from '@/components/cert/CertReligious';
import { CertCommunity } from '@/components/cert/CertCommunity';
import { CertSea } from '@/components/cert/CertSea';
import { CertAir } from '@/components/cert/CertAir';

function PrintCertInner() {
  const params = useParams();
  const search = useSearchParams();
  const certId = String(params?.id || '');
  const token = search.get('token') || '';

  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overlayMode, setOverlayMode] = useState(true);
  const [showBg, setShowBg] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('請從後台進入（缺少 token）');
      setLoading(false);
      return;
    }
    api.getCertificate(certId, token)
      .then((res: any) => {
        if (res.success) setCert(res.certificate);
        else setError(res.error || '無法載入');
      })
      .catch(() => setError('網路錯誤'))
      .finally(() => setLoading(false));
  }, [certId, token]);

  const pickTemplate = (badgeName: string, category: string) => {
    const b = String(badgeName || '');
    const c = String(category || '');
    if (b.indexOf('宗教') >= 0) return 'religious';
    if (b.indexOf('社區參與') >= 0) return 'community';
    if (c.indexOf('海') >= 0 || b.indexOf('海上') >= 0 || b.indexOf('水手') >= 0 || b.indexOf('艇') >= 0) return 'sea';
    if (c.indexOf('航空') >= 0 || b.indexOf('航空') >= 0) return 'air';
    return 'standard';
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>載入中...</div>;
  if (error) return <div style={{ padding: 40, color: '#c62828', textAlign: 'center' }}>❌ {error}</div>;
  if (!cert) return <div style={{ padding: 40 }}>找不到證書</div>;

  const tpl = pickTemplate(cert.badgeName || '', cert.category || '');
  const props = { data: cert, showBg };

  return (
    <>
      {/* Toolbar - 列印時隱藏 */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#003366', color: 'white',
        padding: '12px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <strong>🖨️ 證書列印</strong>
        <span style={{ fontSize: 13 }}>{cert.memberName} · {cert.badgeName} · {cert.certificateNumber}</span>
        <div style={{ flex: 1 }} />
        <label style={{ fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showBg} onChange={e => setShowBg(e.target.checked)} />
          {' '}螢幕顯示底圖
        </label>
        <label style={{ fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={overlayMode} onChange={e => setOverlayMode(e.target.checked)} />
          {' '}套印預印紙（列印時隱藏底圖）
        </label>
        <button
          onClick={() => window.print()}
          style={{
            padding: '8px 20px', background: '#4caf50', color: 'white',
            border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer'
          }}
        >
          🖨️ 列印
        </button>
        <button
          onClick={() => window.close()}
          style={{
            padding: '8px 16px', background: '#777', color: 'white',
            border: 'none', borderRadius: 6, cursor: 'pointer'
          }}
        >
          關閉
        </button>
      </div>

      {/* 列印區 */}
      <div className={`cert-print-area ${overlayMode ? 'overlay-mode' : ''}`}>
        {tpl === 'standard'  && <CertStandard {...props} />}
        {tpl === 'religious' && <CertReligious {...props} />}
        {tpl === 'community' && <CertCommunity {...props} />}
        {tpl === 'sea'       && <CertSea {...props} />}
        {tpl === 'air'       && <CertAir {...props} />}
      </div>

      <style jsx global>{`
        @page {
          size: A5 landscape;
          margin: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }
        .cert-print-area {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        @media print {
          html, body { background: white; }
          .no-print { display: none !important; }
          .cert-print-area { padding: 0; }
          .cert-page { box-shadow: none !important; }
          .cert-print-area.overlay-mode .cert-bg-image { display: none !important; }
        }
      `}</style>
    </>
  );
}

export default function PrintCertPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>載入中...</div>}>
      <PrintCertInner />
    </Suspense>
  );
}
