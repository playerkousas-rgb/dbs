import PrintCertClient from './PrintCertClient';

// Static export（output: 'export'）規定動態路由必須提供 generateStaticParams，
// 但證書 ID 只會在 runtime 出現（資料由 Client Component 透過 Apps Script API 取得），
// 建置時無法列舉。
// 因此這裡只輸出一個 placeholder shell（out/admin/print-cert/_.html），
// 再由 vercel.json 的 rewrites 把 /admin/print-cert/:id 指向該 shell；
// 實際的 id 由 PrintCertClient 內的 useParams() 從瀏覽器 URL 解析。
export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function PrintCertPage() {
  return <PrintCertClient />;
}
