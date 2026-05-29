'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

export function CertStandard({ data, showBg = true }: Props) {
  const fmtDate = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // ★ 直接使用數據，不過濾數字
  const memberName = String(data.memberName || '');
  const memberNameEn = String(data.memberNameEn || '');
  const groupNameCn = String(data.groupNameCn || data.groupId || '');
  const badgeName = String(data.badgeName || '');
  const badgeNameEn = String(data.badgeNameEn || '');
  const category = String(data.category || '');
  const categoryEn = String(data.categoryEn || '');
  const certNo = String(data.certificateNumber || '');
  const resultDateStr = fmtDate(data.resultDate || data.readyAt || '');

  // ★ 簽發人：合併為單一欄位，用 \n 換行，避免重疊
  const sCn = String(data.signerTitleCn || '楊德銘');
  const sEn = String(data.signerTitleEn || 'Yeung Tak Ming');
  const sLabel = String(data.signerLabelCn || '助理區總監(童軍)');
  
  const signerText = [sCn, sEn, sLabel].filter(Boolean).join('\n');

  const fields: CertField[] = [
    // 中文姓名
    memberName && {
      text: memberName,
      left: 50, top: 22,
      width: 50,
      size: 5,
      weight: 600,
      align: 'center',
    },
    // 英文姓名
    memberNameEn && {
      text: memberNameEn,
      left: 50, top: 29,
      width: 50,
      size: 3.5,
      weight: 400,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // 旅號
    groupNameCn && {
      text: groupNameCn,
      left: 50, top: 38,
      width: 50,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // 專章中文（左）
    badgeName && {
      text: badgeName,
      left: 36, top: 50,
      width: 26,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // 專章英文
    badgeNameEn && {
      text: badgeNameEn,
      left: 36, top: 56,
      width: 26,
      size: 4.5,
      weight: 700,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // 組別中文（右）
    category && {
      text: category,
      left: 64, top: 50,
      width: 20,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // 組別英文
    categoryEn && {
      text: categoryEn,
      left: 64, top: 56,
      width: 20,
      size: 4.5,
      weight: 700,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // 日期
    resultDateStr && {
      text: resultDateStr,
      left: 10, top: 70,
      size: 4,
      weight: 700,
      align: 'left',
    },
    // 證書編號
    certNo && {
      text: certNo,
      left: 10, top: 76,
      size: 3.5,
      align: 'left',
      font: 'monospace',
    },
    // ★ 簽發人（合併為單一 field）
    {
      text: signerText,
      left: 76, top: 72,
      width: 24,
      size: 3.5,
      weight: 600,
      align: 'center',
      lineHeight: 1.3,
    },
  ].filter(Boolean) as CertField[];

  return <CertBase bgUrl="/cert-bg/standard.jpg" fields={fields} showBg={showBg} />;
}
