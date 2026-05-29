'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

export function CertCommunity({ data, showBg = true }: Props) {
  const fmtDate = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const memberName = String(data.memberName || '');
  const memberNameEn = String(data.memberNameEn || '');
  const groupNameCn = String(data.groupNameCn || data.groupId || '');
  const badgeName = String(data.badgeName || '');
  const badgeNameEn = String(data.badgeNameEn || '');
  const category = String(data.category || '');
  const categoryEn = String(data.categoryEn || '');
  const certNo = String(data.certificateNumber || '');
  const resultDateStr = fmtDate(data.resultDate || data.readyAt || '');

  const signerLine1 = "楊德銘 Yeung Tak Ming";
  const signerLine2 = "助理區總監 (童軍)";

  const fields: CertField[] = [
    memberName && { text: memberName, left: 50, top: 36, width: 50, size: 5, weight: 600, align: 'center' },
    memberNameEn && { text: memberNameEn, left: 50, top: 40, width: 50, size: 3.5, weight: 400, align: 'center', font: 'Times New Roman, serif' },
    groupNameCn && { text: groupNameCn, left: 50, top: 48, width: 50, size: 4.5, weight: 600, align: 'center' },
    badgeName && { text: badgeName, left: 38, top: 62, width: 26, size: 4.5, weight: 600, align: 'center' },
    badgeNameEn && { text: badgeNameEn, left: 38, top: 66, width: 26, size: 4.5, weight: 700, align: 'center', font: 'Times New Roman, serif' },
    category && { text: category, left: 58, top: 62, width: 20, size: 4.5, weight: 600, align: 'center' },
    categoryEn && { text: categoryEn, left: 58, top: 66, width: 20, size: 4.5, weight: 700, align: 'center', font: 'Times New Roman, serif' },
    resultDateStr && { text: resultDateStr, left: 12, top: 80, size: 4, weight: 700, align: 'left' },
    certNo && { text: certNo, left: 12, top: 85, size: 3.5, align: 'left', font: 'monospace' },
    { text: signerLine1, left: 78, top: 85, width: 22, size: 3.2, weight: 600, align: 'center' },
    { text: signerLine2, left: 78, top: 89, width: 22, size: 3, weight: 400, align: 'center' },
  ].filter(Boolean) as CertField[];

  return <CertBase bgUrl="/cert-bg/community.jpg" fields={fields} showBg={showBg} />;
}
