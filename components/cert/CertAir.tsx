'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

/** 航空活動徽章證書 — 藍色 */
export function CertAir({ data, showBg = true }: Props) {
  const fmtDate = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const nameDisplay = [data.memberName || '', data.memberNameEn || ''].filter(Boolean).join('\n');
  const groupDisplay = data.groupNameCn || data.groupId || '';
  const badgeName = data.badgeName || '';
  const badgeNameEn = data.badgeNameEn || '';
  const signerCn = data.signerTitleCn || '';
  const signerEn = data.signerTitleEn || '';
  const certNo = data.certificateNumber || '';

  const fields: CertField[] = [
    { text: nameDisplay, left: 42, top: 28, width: 55, size: 5, align: 'center' },
    { text: groupDisplay, left: 42, top: 42, width: 55, size: 4.5, align: 'center' },
    { text: `${badgeName}  ${badgeNameEn}`.trim(), left: 42, top: 56, width: 50, size: 4.5, weight: 600, align: 'center' },
    { text: fmtDate(data.resultDate || data.readyAt || ''), left: 13, top: 72, size: 4.5, weight: 700, align: 'left' },
    { text: certNo, left: 6, top: 79, size: 3.5, align: 'left' },
    { text: `${signerCn} ${signerEn}`.trim(), left: 72, top: 72, width: 28, size: 3.5, align: 'center' },
  ];

  return <CertBase bgUrl="/cert-bg/air.jpg" fields={fields} showBg={showBg} />;
}
