'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

/**
 * 童軍專科徽章證書 — 標準版
 * 根據成品圖修正座標
 */
export function CertStandard({ data, showBg = true }: Props) {
  const fmtDate = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // ★ 清理數據：去除可能混入的「資料列」數字 (1-99)
  const clean = (v: any) => {
    if (typeof v === 'number' && v >= 1 && v <= 99) return '';
    if (typeof v === 'string' && /^\d{1,2}$/.test(v.trim())) return '';
    return String(v || '');
  };

  const memberName = clean(data.memberName) || data.memberName || '';
  const memberNameEn = clean(data.memberNameEn) || '';
  const groupNameCn = clean(data.groupNameCn) || data.groupName || '';
  const badgeName = clean(data.badgeName) || '';
  const badgeNameEn = clean(data.badgeNameEn) || '';
  const category = clean(data.category) || '';
  const categoryEn = clean(data.categoryEn) || '';
  const certNo = clean(data.certificateNumber) || data.certificateNumber || '';
  const resultDateStr = fmtDate(data.resultDate || data.readyAt || '');

  // 簽發人
  const signerTitleCn = clean(data.signerTitleCn) || '楊德銘';
  const signerTitleEn = clean(data.signerTitleEn) || 'Yeung Tak Ming';
  const signerLabel = clean(data.signerLabelCn) || '助理區總監(童軍)';

  const fields: CertField[] = [
    // 中文姓名 — 頂部「茲證明」下方
    {
      text: memberName,
      left: 50, top: 26,
      width: 60,
      size: 5,
      weight: 600,
      align: 'center',
    },
    // 英文姓名 — 中文姓名下方
    memberNameEn && {
      text: memberNameEn,
      left: 50, top: 31,
      width: 60,
      size: 3.5,
      weight: 400,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // 旅號（中文）— 「隸屬 of」線
    {
      text: groupNameCn,
      left: 50, top: 38,
      width: 50,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // 專章中文（左側）
    {
      text: badgeName,
      left: 36, top: 50,
      width: 28,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // 專章英文
    {
      text: badgeNameEn,
      left: 36, top: 56,
      width: 28,
      size: 4.5,
      weight: 700,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // 組別中文（右側）
    {
      text: category,
      left: 63, top: 50,
      width: 18,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // 組別英文
    {
      text: categoryEn,
      left: 63, top: 56,
      width: 18,
      size: 4.5,
      weight: 700,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // 日期 — 左下角
    {
      text: resultDateStr,
      left: 12, top: 72,
      size: 4,
      weight: 700,
      align: 'left',
    },
    // 證書編號 — 日期下方
    {
      text: certNo,
      left: 12, top: 77,
      size: 3.5,
      align: 'left',
      font: 'monospace',
    },
    // 簽發人姓名 — 右下角
    signerTitleCn && {
      text: signerTitleCn,
      left: 80, top: 68,
      width: 20,
      size: 4,
      weight: 600,
      align: 'center',
    },
    // 簽發人英文姓名
    signerTitleEn && {
      text: signerTitleEn,
      left: 80, top: 73,
      width: 20,
      size: 3.2,
      weight: 400,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // 簽發人職銜
    signerLabel && {
      text: signerLabel,
      left: 80, top: 78,
      width: 20,
      size: 3,
      weight: 400,
      align: 'center',
    },
  ].filter(Boolean) as CertField[];

  return <CertBase bgUrl="/cert-bg/standard.jpg" fields={fields} showBg={showBg} />;
}
