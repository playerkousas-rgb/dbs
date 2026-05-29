'use client';

import { CertBase, CertField } from './CertBase';

interface Props {
  data: any;
  showBg?: boolean;
}

/**
 * 宗教章證書 (Religious Badge Certificate)
 *
 * 與標準版差異：
 *  • 不顯示 category / Group 括號（此章無組別欄）
 *  • 不顯示證書編號（此章原表單無）
 *  • 右下簽名線印「楊德銘 助理區總監(童軍)」
 *
 * 背景關鍵橫線實測 (1200×845 → A5 横向):
 *   姓名線      y ≈ 43.1%   (x 30.5%–68.6%, 中心 49.5%)
 *   旅號線      y ≈ 52.7%   (x 30.5%–68.6%, 中心 49.5%)
 *   考獲線      y ≈ 68.7%   (x 36.9%–60.5%, 中心 48.7%) — 後接「宗教章 Religious Badge」
 *   左下日期線  y ≈ 82.4%   (x 13.7%–32.8%)
 *   右下簽名線  y ≈ 82.4%   (x 62.7%–83.5%, 中心 73.1%)
 *
 * 文字座標規則沿用 CertStandard:
 *   姓名文字 top  = 線 − 7.6 pp
 *   旅號文字 top  = 線 − 5.1 pp
 *   考獲文字 top  = 線 − 7.2 pp
 *   日期文字 top  = 線 − 4.3 pp
 */
export function CertReligious({ data, showBg = true }: Props) {
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
    // 1. 中文姓名
    memberName && {
      text: memberName,
      left: 49.5, top: 35.5,
      width: 50,
      size: 5, weight: 600, align: 'center',
    },
    // 2. 英文姓名
    memberNameEn && {
      text: memberNameEn,
      left: 49.5, top: 39.5,
      width: 50,
      size: 3.5, weight: 400, align: 'center',
      font: 'Times New Roman, serif',
    },
    // 3. 旅號
    groupNameCn && {
      text: groupNameCn,
      left: 49.5, top: 47.5,
      width: 50,
      size: 4.5, weight: 600, align: 'center',
    },
    // 4. 專章中文
    badgeName && {
      text: badgeName,
      left: 48.7, top: 61.5,
      width: 24,
      size: 4.5, weight: 600, align: 'center',
    },
    // 5. 專章英文
    badgeNameEn && {
      text: badgeNameEn,
      left: 48.7, top: 65.5,
      width: 24,
      size: 4.5, weight: 700, align: 'center',
      font: 'Times New Roman, serif',
    },
    // 6. 日期（左下）
    resultDateStr && {
      text: resultDateStr,
      left: 15, top: 78,
      size: 4, weight: 700, align: 'left',
    },
    // 7. 簽發人姓名（右下簽名線上方）
    {
      text: signerLine1,
      left: 73.1, top: 78,
      width: 22,
      size: 3.2, weight: 600, align: 'center',
    },
    // 8. 簽發人職銜
    {
      text: signerLine2,
      left: 73.1, top: 82,
      width: 22,
      size: 3, weight: 400, align: 'center',
    },
  ].filter(Boolean) as CertField[];

  return <CertBase bgUrl="/cert-bg/religious.jpg" fields={fields} showBg={showBg} />;
}
