'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

/** 社區參與章證書 — 黃底咖啡字 */
export function CertCommunity({ data, showBg = true }: Props) {
  const fmtDate = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const nameDisplay = [data.memberName || '', data.memberNameEn || ''].filter(Boolean).join('\n');
  const groupDisplay = data.groupNameCn || data.groupId || '';
  const badgeName = data.badgeName || '社區參與';
  const signerCn = data.signerTitleCn || '';
  const signerEn = data.signerTitleEn || '';
  const certNo = data.certificateNumber || '';

  const fields: CertField[] = [
    {
      text: nameDisplay,
      left: 45, top: 32,
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
    {
      text: badgeName,
      left: 38, top: 62,
      width: 40,
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
    {
      text: `${signerCn} ${signerEn}`.trim(),
      left: 80, top: 78,
      width: 35,
      size: 3.5,
      align: 'center',
    },
  ];

  return <CertBase bgUrl="/cert-bg/community.jpg" fields={fields} showBg={showBg} />;
}
