'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

/**
 * 童軍專科徽章證書（菱形綠）
 * 9 成的章都用這個（興趣/技能/服務/教導）
 */
export function CertStandard({ data, showBg = true }: Props) {
  const fmtDate = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // 中文姓名 + 英文姓名（兩行）
  const nameDisplay = [data.memberName || '', data.memberNameEn || ''].filter(Boolean).join('\n');

  // 旅號（中文）
  const groupDisplay = data.groupNameCn || data.groupId || '';

  // 專章中文 + 英文（標準章=Pursuit/Service/Interest/Instructor 不顯示英文章名直接顯示主章 badgeName）
  const badgeName = data.badgeName || '';        // 例：觀察 / 手藝 (釘書)
  const badgeNameEn = data.badgeNameEn || '';    // 例：Observer
  const category = data.category || '';          // 技能
  const categoryEn = data.categoryEn || 'Pursuit'; // Pursuit

  // 簽署人
  const signerCn = data.signerTitleCn || '楊德銘';
  const signerEn = data.signerTitleEn || 'Yeung Tak Ming';

  // 證書編號
  const certNo = data.certificateNumber || '';

  const fields: CertField[] = [
    // 姓名（中英文）— 證書上方填名線
    {
      text: nameDisplay,
      left: 50, top: 27,
      width: 70,
      size: 5,
      align: 'center',
    },
    // 旅號 — 「隸屬 / of」線
    {
      text: groupDisplay,
      left: 50, top: 40,
      width: 70,
      size: 4.5,
      align: 'center',
    },
    // 專章中文（觀察）
    {
      text: badgeName,
      left: 35, top: 53.5,
      width: 30,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // 專章英文（Observer）
    {
      text: badgeNameEn,
      left: 35, top: 59,
      width: 30,
      size: 4.5,
      weight: 700,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // 組別中文（技能）
    {
      text: category,
      left: 62, top: 53.5,
      width: 18,
      size: 4.5,
      weight: 600,
      align: 'center',
    },
    // 組別英文（Pursuit）
    {
      text: categoryEn,
      left: 62, top: 59,
      width: 18,
      size: 4.5,
      weight: 700,
      align: 'center',
      font: 'Times New Roman, serif',
    },
    // 日期
    {
      text: fmtDate(data.resultDate || data.readyAt || ''),
      left: 13, top: 73,
      size: 4.5,
      weight: 700,
      align: 'left',
    },
    // 證書編號
    {
      text: certNo,
      left: 6, top: 81,
      size: 3.5,
      align: 'left',
    },
  ];

  return <CertBase bgUrl="/cert-bg/standard.jpg" fields={fields} showBg={showBg} />;
}
