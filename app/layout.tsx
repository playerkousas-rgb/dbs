export const metadata = {
  title: '筲箕灣區專科徽章系統',
  description: 'SKW Scout Badge Examination System'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f5f5' }}>
        <header style={{ background: '#003366', color: 'white', padding: '16px 24px' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>🏕️ 筲箕灣區專科徽章管理系統</h1>
        </header>
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
          {children}
        </main>
        <footer style={{ textAlign: 'center', padding: '24px', color: '#666', fontSize: '14px' }}>
          © 筲箕灣區童軍 · 系統 v2.0
        </footer>
      </body>
    </html>
  );
}