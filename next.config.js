/** @type {import('next').NextConfig} */
const nextConfig = {
  // 靜態匯出：整個站台無 app/api 路由、無 Server Actions / middleware，
  // 資料全部由 Client Component 透過 Google Apps Script API 取得。
  // 動態路由 /admin/print-cert/[id] 使用 useParams（Client），
  // export 模式下會產出 [id].html SPA shell，Vercel 會自動 rewrite。
  output: 'export',

  // Static export 不支援 Next Image Optimization，必須停用
  images: { unoptimized: true }
};

module.exports = nextConfig;
