'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface BadgeInfo {
  badgeName: string;
  badgeCode: string;
  badgeNameEn: string;
  category: string;
  fullTitle: string;
}

interface GroupInfo {
  groupId: string;
  groupNumber: number;
  groupName: string;
}

export default function ExaminerApplyPage() {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    groupId: '',
    rank: '',
    yearsOfService: '',
    selectedBadges: [] as string[],
    qualifications: '',
    remarks: ''
  });

  useEffect(() => {
    setDataLoading(true);
    Promise.all([
      api.getBadgeCodes().catch(() => ({ success: false })),
      api.getGroups().catch(() => ({ success: false }))
    ]).then(([badgeRes, groupRes]) => {
      if (badgeRes.success) setBadges(badgeRes.badges || []);
      if (groupRes.success) setGroups(groupRes.groups || []);
      setDataLoading(false);
    });
  }, []);

  const badgeCategories = [...new Set(badges.map(b => b.category).filter(Boolean))];
  const [filterCategory, setFilterCategory] = useState('');
  const filteredBadges = filterCategory ? badges.filter(b => b.category === filterCategory) : badges;

  const toggleBadge = (code: string) => {
    setForm(prev => ({
      ...prev,
      selectedBadges: prev.selectedBadges.includes(code)
        ? prev.selectedBadges.filter(b => b !== code)
        : [...prev.selectedBadges, code]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.selectedBadges.length === 0) {
      setError('請至少選擇一個申請專章');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const selectedBadgeNames = form.selectedBadges.map(code => {
        const b = badges.find(x => x.badgeCode === code);
        return b ? b.fullTitle + ' (' + code + ')' : code;
      });
      const res = await api.submitExaminerApplication({
        name: form.name, email: form.email, phone: form.phone,
        groupId: form.groupId, rank: form.rank, yearsOfService: form.yearsOfService,
        badges: selectedBadgeNames.join(', '),
        badgeCodes: form.selectedBadges.join(','),
        qualifications: form.qualifications, remarks: form.remarks
      });
      if (res.success) { setSubmitted(true); }
      else { setError(res.error || '提交失敗'); }
    } catch (err) { setError('網絡錯誤，請稍後重試'); }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
        <h2 style={{ color: '#2e7d32' }}>✅ 主考申請已提交</h2>
        <p style={{ fontSize: '16px', margin: '16px 0', color: '#333' }}>感謝您申請成為筲箕灣區專科徽章主考！</p>
        <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '8px', margin: '16px 0', textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 8px', color: '#003366' }}>📋 接下來的流程</h4>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#333' }}>
            <li>助理區總監（童軍）將審閱您的申請</li>
            <li>審批通過後，您將收到電郵通知</li>
            <li>您的資料將加入主考名冊，開始接受考核指派</li>
          </ol>
        </div>
        <a href="/" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px', background: '#003366', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>返回首頁</a>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '16px' }}>⏳ 載入系統資料中...</p>
      </div>
    );
  }

  const rankOptions = ['領袖', '副團長', '團長', '助理區總監', '區總監', '其他'];

  return (
    <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
      <h2 style={{ color: '#003366', marginTop: 0 }}>👨‍🏫 專科徽章主考申請</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
        歡迎筲箕灣區領袖申請成為專科徽章主考。填寫以下資料後，助理區總監（童軍）將審閱您的申請。
      </p>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="個人資料">
          <Row>
            <Input label="姓名" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} required placeholder="例如：陳大文先生" />
            <Input label="電郵" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} required type="email" placeholder="接收審批結果及考核通知" />
          </Row>
          <Row>
            <Input label="電話" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} required />
            <div>
              <label style={labelStyle}>所屬旅團 <span style={{ color: '#c62828' }}>*</span></label>
              <select value={form.groupId} required onChange={e => setForm(p => ({ ...p, groupId: e.target.value }))} style={selectStyle}>
                <option value="">請選擇...</option>
                {groups.map(g => <option key={g.groupId} value={g.groupId}>{g.groupName} ({g.groupNumber}th)</option>)}
                <option value="DISTRICT">區職員（不屬於特定旅團）</option>
              </select>
            </div>
          </Row>
          <Row>
            <div>
              <label style={labelStyle}>職級 <span style={{ color: '#c62828' }}>*</span></label>
              <select value={form.rank} required onChange={e => setForm(p => ({ ...p, rank: e.target.value }))} style={selectStyle}>
                <option value="">請選擇...</option>
                {rankOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Input label="童軍服務年資" value={form.yearsOfService} onChange={v => setForm(p => ({ ...p, yearsOfService: v }))} placeholder="例如：8年" />
          </Row>
        </Section>

        <Section title="申請主考的專章（可多選）">
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>按類別篩選</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <FilterBtn active={filterCategory === ''} onClick={() => setFilterCategory('')} label="全部" />
              {badgeCategories.map(c => <FilterBtn key={c} active={filterCategory === c} onClick={() => setFilterCategory(c)} label={c} />)}
            </div>
          </div>

          {form.selectedBadges.length > 0 && (
            <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
              <strong style={{ fontSize: '14px' }}>已選 {form.selectedBadges.length} 個專章：</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                {form.selectedBadges.map(code => {
                  const b = badges.find(x => x.badgeCode === code);
                  return (
                    <span key={code} onClick={() => toggleBadge(code)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                      background: '#2e7d32', color: 'white', cursor: 'pointer'
                    }}>{b ? b.badgeName : code} ✕</span>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '4px' }}>
            {filteredBadges.map(b => {
              const isSelected = form.selectedBadges.includes(b.badgeCode);
              return (
                <label key={b.badgeCode} style={{
                  display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer',
                  borderBottom: '1px solid #f5f5f5', background: isSelected ? '#e8f5e9' : 'transparent'
                }}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleBadge(b.badgeCode)} style={{ marginRight: '10px', width: '18px', height: '18px' }} />
                  <span style={{ flex: 1 }}>
                    <span style={{ fontWeight: isSelected ? 700 : 400 }}>{b.fullTitle || b.badgeName}</span>
                    <span style={{ color: '#999', fontSize: '12px', marginLeft: '6px' }}>({b.badgeCode})</span>
                  </span>
                  <span style={{
                    padding: '1px 8px', borderRadius: '4px', fontSize: '11px',
                    background: b.category === '興趣' ? '#e8f5e9' : b.category === '技能' ? '#e3f2fd' : b.category === '服務' ? '#fff3e0' : b.category === '教導' ? '#f3e5f5' : '#f5f5f5',
                    color: b.category === '興趣' ? '#2e7d32' : b.category === '技能' ? '#1565c0' : b.category === '服務' ? '#e65100' : b.category === '教導' ? '#7b1fa2' : '#666'
                  }}>{b.category || '其他'}</span>
                </label>
              );
            })}
          </div>
        </Section>

        <Section title="資歷說明">
          <textarea value={form.qualifications} onChange={e => setForm(p => ({ ...p, qualifications: e.target.value }))} required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '100px', boxSizing: 'border-box' }}
            placeholder={'請說明您的相關資歷及經驗，例如：\n- 持有聖約翰急救證書（2023）\n- 露營經驗 5 年，曾帶領旅團參加大露營\n- 完成先鋒工程導師訓練課程'} />
        </Section>

        <Section title="備註（選填）">
          <textarea value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px', boxSizing: 'border-box' }}
            placeholder="如有其他補充事項" />
        </Section>

        <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          <strong>📋 審批流程：</strong><br/>
          提交申請 → 助理區總監（童軍）審閱 → 批准後加入主考名冊 → 開始接受考核指派
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '14px', background: loading ? '#ccc' : '#003366',
          color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
          fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
        }}>{loading ? '提交中...' : '提交主考申請'}</button>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 };
const selectStyle: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', boxSizing: 'border-box' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #eee' }}>
    <h3 style={{ color: '#003366', fontSize: '16px', marginBottom: '16px' }}>{title}</h3>{children}</div>);
}
function Row({ children }: { children: React.ReactNode }) {
  return (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>{children}</div>);
}
function Input({ label, value, onChange, required, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; placeholder?: string }) {
  return (<div><label style={labelStyle}>{label} {required && <span style={{ color: '#c62828' }}>*</span>}</label>
    <input type={type} value={value} required={required} placeholder={placeholder} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} /></div>);
}
function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (<button type="button" onClick={onClick} style={{
    padding: '4px 14px', borderRadius: '16px', border: 'none', fontSize: '13px', fontWeight: 600,
    background: active ? '#003366' : '#e0e0e0', color: active ? 'white' : '#333', cursor: 'pointer'
  }}>{label}</button>);
}
