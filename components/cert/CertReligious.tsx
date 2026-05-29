'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

/** 宗教章證書 — 黃底紫字（無組別/Group 欄位） */
export function CertReligious({ data, showBg = true }: Props) {
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
    {
      text: nameDisplay,
      left: 45, top: 30,
      width: 60,
      size: 5,
      align: 'center',
    },
    {
      text: groupDisplay,
      left: 45, top: 45,
      width: 60,
      size: 4.5,
      align: 'center',
    },
    // 章名（中+英）
    {
      text: `${badgeName}  ${badgeNameEn}`.trim(),
      left: 45, top: 62,
      width: 50,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    {
      text: fmtDate(data.resultDate || data.readyAt || ''),
      left: 13, top: 76,
      size: 4.5,
      weight: 700,
      align: 'left',
    },
    {
      text: certNo,
      left: 6, top: 83,
      size: 3.5,
      align: 'left',
    },
    // 簽署人（右下）
    {
      text: `${signerCn} ${signerEn}`.trim(),
      left: 80, top: 78,
      width: 35,
      size: 3.5,
      align: 'center',
    },
  ];

  return <CertBase bgUrl="/cert-bg/religious.jpg" fields={fields} showBg={showBg} />;
}
