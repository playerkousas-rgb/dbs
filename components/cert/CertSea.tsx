'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

/**
 * 海上活動徽章證書 (Sea Activity Badge Certificate)
 *
 * 與標準版差異：無組別括號、無證書編號；「考獲」線較長，文字置中於線中央。
 *
 * 背景關鍵橫線實測 (1200×845):
 *   姓名線      y ≈ 42.7%   (x 30.0%–67.8%, 中心 48.9%)
 *   旅號線      y ≈ 54.0%   (x 26.1%–71.8%, 中心 48.9%)
 *   考獲線      y ≈ 70.1%   (x 30.2%–68.1%, 中心 49.2%) — 整條長線
 *   左下日期線  y ≈ 85.6%   (x ~13%–33%)
 *   右下簽名線  y ≈ 85.6%   (x 63.2%–82.4%, 中心 72.8%)
 *
 * 文字偏移規則沿用 CertStandard。
 */
export function CertSea({ data, showBg = true }: Props) {
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
  const resultDateStr = fmtDate(data.resultDate || data.readyAt || '');

  const signerLine1 = '楊德銘 Yeung Tak Ming';
  const signerLine2 = '助理區總監(童軍)';

  const fields: CertField[] = [
    memberName && {
      text: memberName,
      left: 48.9, top: 35,
      width: 50,
      size: 5, weight: 600, align: 'center',
    },
    memberNameEn && {
      text: memberNameEn,
      left: 48.9, top: 39,
      width: 50,
      size: 3.5, weight: 400, align: 'center',
      font: 'Times New Roman, serif',
    },
    groupNameCn && {
      text: groupNameCn,
      left: 48.9, top: 49,
      width: 55,
      size: 4.5, weight: 600, align: 'center',
    },
    badgeName && {
      text: badgeName,
      left: 49.2, top: 63,
      width: 38,
      size: 4.5, weight: 600, align: 'center',
    },
    badgeNameEn && {
      text: badgeNameEn,
      left: 49.2, top: 67,
      width: 38,
      size: 4.5, weight: 700, align: 'center',
      font: 'Times New Roman, serif',
    },
    resultDateStr && {
      text: resultDateStr,
      left: 15, top: 81.3,
      size: 4, weight: 700, align: 'left',
    },
    {
      text: signerLine1,
      left: 72.8, top: 81.3,
      width: 22,
      size: 3.2, weight: 600, align: 'center',
    },
    {
      text: signerLine2,
      left: 72.8, top: 85.3,
      width: 22,
      size: 3, weight: 400, align: 'center',
    },
  ].filter(Boolean) as CertField[];

  return <CertBase bgUrl="/cert-bg/sea.jpg" fields={fields} showBg={showBg} />;
}
