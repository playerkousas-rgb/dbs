'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

/**
 * ★ 清理數據：過濾 CertificatePrintList 欄 A（資料列編號 1-99）
 * 不使用 fallback，clean() 結果即最終值
 */
function clean(v: any): string {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  if (/^\d{1,2}$/.test(s)) return '';
  return s;
}

/**
 * 童軍專科徽章證書 — 標準版
 * 
 * 從 CertificatePrintList 讀取：
 *   D欄 = 中文姓名 (memberName)
 *   E欄 = 英文姓名 (memberNameEn)
 */
export function CertStandard({ data, showBg = true }: Props) {
  const fmtDate = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // ★ 從 CertificatePrintList D欄/E欄 讀取（經過 clean 過濾）
  const memberName = clean(data.memberName);
  const memberNameEn = clean(data.memberNameEn);
  const groupNameCn = clean(data.groupNameCn) || clean(data.groupId);
  const badgeName = clean(data.badgeName);
  const badgeNameEn = clean(data.badgeNameEn);
  const category = clean(data.category);
  const categoryEn = clean(data.categoryEn);
  const certNo = clean(data.certificateNumber);
  const resultDateStr = fmtDate(data.resultDate || data.readyAt || '');

  // ★ 簽發人精簡（只印中文姓名+職銜，不印英文）
  const signerTitleCn = clean(data.signerTitleCn) || '楊德銘';
  const signerLabelCn = clean(data.signerLabelCn) || '助理區總監(童軍)';

  const fields: CertField[] = [
    // ★ 中文姓名 — CertificatePrintList D欄
    memberName && {
      text: memberName,
      left: 50, top: 34,
      width: 50,
      size: 5,
      weight: 600,
      align: 'center',
    },
    // ★ 英文姓名 — CertificatePrintList E欄
    memberNameEn && {
      text: memberNameEn,
      left: 50, top: 40,
      width: 50,
      size: 3.5,
      weight: 400,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // ★ 旅號
    groupNameCn && {
      text: groupNameCn,
      left: 50, top: 48,
      width: 50,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // ★ 專章中文（左側）
    badgeName && {
      text: badgeName,
      left: 36, top: 60,
      width: 26,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // ★ 專章英文
    badgeNameEn && {
      text: badgeNameEn,
      left: 36, top: 66,
      width: 26,
      size: 4.5,
      weight: 700,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // ★ 組別中文（右側）
    category && {
      text: category,
      left: 64, top: 60,
      width: 20,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // ★ 組別英文
    categoryEn && {
      text: categoryEn,
      left: 64, top: 66,
      width: 20,
      size: 4.5,
      weight: 700,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // ★ 日期
    resultDateStr && {
      text: resultDateStr,
      left: 12, top: 82,
      size: 4,
      weight: 700,
      align: 'left',
    },
    // ★ 證書編號
    certNo && {
      text: certNo,
      left: 12, top: 87,
      size: 3.5,
      align: 'left',
      font: 'monospace',
    },
    // ★ 簽發人（精簡：只印中文姓名+職銜）
    {
      text: `${signerTitleCn}\n${signerLabelCn}`,
      left: 76, top: 82,
      width: 24,
      size: 3.5,
      weight: 600,
      align: 'center',
      lineHeight: 1.3,
    },
  ].filter(Boolean) as CertField[];

  return <CertBase bgUrl="/cert-bg/standard.jpg" fields={fields} showBg={showBg} />;
}
