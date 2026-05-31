'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', marginBottom: '24px' }}>
        <h2 style={{ color: '#003366', marginBottom: '16px' }}>筲箕灣區童軍專科徽章全自動管理系統</h2>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto 24px' }}>
          整合報考、審批、主考派發、成績回報、證書領取於一體。<br/>
          考生、主考、專章秘書各取所需，流程自動推進。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <Card 
          title="📝 報考專章" 
          desc="查看主考名單，填寫申請表，系統自動通知家長及團長。"
          href="/apply"
          btn="立即報考"
          primary
        />
        <Card 
          title="🔍 進度查詢" 
          desc="輸入申請編號及童軍成員編號(YMIS)，隨時追蹤考核進度。"
          href="/status"
          btn="查詢進度"
        />
        <Card 
          title="📋 待領證書" 
          desc="公開查詢已製作完成、待領取的專科徽章證書列表。"
          href="/certificates"
          btn="查看列表"
        />
        <Card 
          title="👨‍🏫 主考申請" 
          desc="領袖可申請成為專科徽章主考，經審批後加入主考名冊。"
          href="/examiner-apply"
          btn="申請主考"
        />
        <Card 
          title="🗂️ 主考專區" 
          desc="查詢主考申請審批進度；助理區總監（ADC）登入審批主考委任。"
          href="/adc"
          btn="進度查詢 / ADC 審批"
        />
        <Card 
          title="⚙️ 秘書後台" 
          desc="審批申請、指派主考、管理證書隊列、查看統計報表。"
          href="/admin"
          btn="進入後台"
        />
      </div>
    </div>
  );
}

function Card({ title, desc, href, btn, primary }: any) {
  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 8px', color: '#003366', fontSize: '18px' }}>{title}</h3>
      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px', minHeight: '40px' }}>{desc}</p>
      <Link href={href}>
        <button style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: primary ? '#003366' : '#e0e0e0',
          color: primary ? 'white' : '#333',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          {btn}
        </button>
      </Link>
    </div>
  );
}
