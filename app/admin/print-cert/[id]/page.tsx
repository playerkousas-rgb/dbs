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
        if (res.success) {
          // ★ 過濾 CertificatePrintList 欄 A 的資料列編號 (1-99)
          const c = res.certificate;
          const clean = (v: any) => {
            if (v === null || v === undefined) return '';
            const s = String(v).trim();
            if (/^\d{1,2}$/.test(s)) return '';
            return s;
          };
          c.memberName = clean(c.memberName);
          c.memberNameEn = clean(c.memberNameEn);
          c.groupNameCn = clean(c.groupNameCn);
          c.groupNameEn = clean(c.groupNameEn);
          c.badgeName = clean(c.badgeName);
          c.badgeNameEn = clean(c.badgeNameEn);
          c.badgeCode = clean(c.badgeCode);
          c.category = clean(c.category);
          c.categoryEn = clean(c.categoryEn);
          c.certificateNumber = clean(c.certificateNumber);
          // ★ 簽發人精簡：只保留中文，不印英文
          c.signerTitleCn = clean(c.signerTitleCn) || '楊德銘';
          c.signerTitleEn = '';
          c.signerLabelCn = clean(c.signerLabelCn) || '助理區總監(童軍)';
          c.signerLabelEn = '';
          setCert(c);
        } else setError(res.error || '無法載入');
      })
      .catch(() => setError('網路錯誤'))
      .finally(() => setLoading(false));
  }, [certId, token]);

  const handlePrint = async () => {
    if (!cert || !token) return;
    try {
      await api.recordPrintAction(token, certId, {
        memberName: cert.memberName,
        badgeName: cert.badgeName,
        groupId: cert.groupId,
        applicationId: cert.applicationId,
        certificateNumber: cert.certificateNumber,
        resultDate: cert.resultDate,
        printStatus: 'PRINTED',
        printedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Print sync error:', err);
    }
    setTimeout(() => window.print(), 300);
  };

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
  if (error && !cert) return <div style={{ padding: 40, color: '#c62828', textAlign: 'center' }}>❌ {error}</div>;
  if (!cert) return <div style={{ padding: 40 }}>找不到證書</div>;

  const tpl = pickTemplate(cert.badgeName || '', cert.category || '');
  const props = { data: cert, showBg };

  return (
    <div className="cert-print-root" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#e0e0e0',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '50px',
      overflowY: 'auto',
    }}>
      {/* ★ 列印區 — 不包在 header/footer 內 */}
      <div className={`cert-print-area ${overlayMode ? 'overlay-mode' : ''}`}>
        {tpl === 'standard'  && <CertStandard {...props} />}
        {tpl === 'religious' && <CertReligious {...props} />}
        {tpl === 'community' && <CertCommunity {...props} />}
        {tpl === 'sea'       && <CertSea {...props} />}
        {tpl === 'air'       && <CertAir {...props} />}
      </div>

      {/* Toolbar - 只在螢幕顯示 */}
      <div className="cert-toolbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#003366', color: 'white',
        padding: '10px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <strong>🖨️ 證書列印</strong>
        <span style={{ fontSize: 13 }}>{cert.memberName} · {cert.badgeName}</span>
        <div style={{ flex: 1 }} />
        <label style={{ fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showBg} onChange={e => setShowBg(e.target.checked)} /> 底圖
        </label>
        <label style={{ fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={overlayMode} onChange={e => setOverlayMode(e.target.checked)} /> 套印
        </label>
        <button onClick={handlePrint} style={{
          padding: '6px 16px', background: '#4caf50', color: 'white',
          border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer'
        }}>🖨️ 列印</button>
        <button onClick={() => window.close()} style={{
          padding: '6px 12px', background: '#777', color: 'white',
          border: 'none', borderRadius: 4, cursor: 'pointer'
        }}>關閉</button>
      </div>

      <style jsx global>{`
        /* ★ 列印時隱藏 layout 的 header/footer */
        header, footer, main, nav, .no-print {
          display: none !important;
        }
        
        .cert-print-area {
          display: flex;
          justify-content: center;
        }
        
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }
          /* ★ 隱藏 toolbar */
          .cert-toolbar { display: none !important; }
          /* ★ 列印區變為靜態，不覆蓋 */
          .cert-print-root {
            position: static !important;
            background: white !important;
            padding: 0 !important;
            overflow: visible !important;
            z-index: auto !important;
            display: block !important;
          }
          .cert-print-area { padding: 0 !important; }
          .cert-page { box-shadow: none !important; }
          .cert-print-area.overlay-mode .cert-bg-image { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function PrintCertPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>載入中...</div>}>
      <PrintCertInner />
    </Suspense>
  );
}
