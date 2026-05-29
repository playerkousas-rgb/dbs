import Link from 'next/link';

export const metadata = {
  title: '筲箕灣區專科徽章系統',
  description: 'SKW Scout Badge Examination System'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f5f5' }}>
        <header style={{ background: '#003366', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h1 style={{ margin: 0, fontSize: '18px' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
              🏕️ 筲箕灣區專科徽章管理系統
            </Link>
          </h1>
          <nav style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
            <Link href="/apply" style={{ color: '#bbdefb', textDecoration: 'none' }}>📝 報考</Link>
            <Link href="/status" style={{ color: '#bbdefb', textDecoration: 'none' }}>🔍 查詢</Link>
            <Link href="/certificates" style={{ color: '#bbdefb', textDecoration: 'none' }}>📋 證書</Link>
            <Link href="/examiner-apply" style={{ color: '#bbdefb', textDecoration: 'none' }}>👨‍🏫 主考申請</Link>
            <Link href="/admin" style={{ color: '#bbdefb', textDecoration: 'none' }}>⚙️ 後台</Link>
          </nav>
        </header>

        <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
          {children}
        </main>

        {/* 這裡使用了正確的 JSX 註解，並且加上了 no-print */}
        <footer className="no-print" style={{ textAlign: 'center', padding: '24px', color: '#666', fontSize: '13px' }}>
          © 筲箕灣區童軍 · 專科徽章管理系統 v2.1
        </footer>
      </body>
    </html>
  );
}
