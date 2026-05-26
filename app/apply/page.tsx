'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ApplyPage() {
  const [examiners, setExaminers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    memberName: '',
    memberNameEn: '',
    groupId: '',
    phone: '',
    email: '',
    ymNumber: '',
    badgeName: '',
    badgeCategory: '技能',
    applicationMode: 'DISTRICT_ASSIGN',
    selfExaminerName: '',
    remarks: ''
  });

  useEffect(() => {
    api.getActiveExaminers().then(r => {
      if (r.success) setExaminers(r.examiners || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.submitApplication(form);
      if (res.success) {
        setSubmitted(true);
        setResult(res);
      } else {
        setError(res.error || '提交失敗');
      }
    } catch (err: any) {
      setError('網絡錯誤，請稍後重試');
    }
    setLoading(false);
  };

  if (submitted && result) {
    return (
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
        <h2 style={{ color: '#2e7d32' }}>✅ 申請已成功提交</h2>
        <p style={{ fontSize: '18px', margin: '16px 0' }}>
          申請編號：<strong style={{ color: '#003366' }}>{result.applicationId}</strong>
        </p>
        <p style={{ color: '#666' }}>
          系統已自動發送確認電郵至您填寫的地址，<br/>
          並通知團長進行確認。請保存此編號以便查詢進度。
        </p>
        <p style={{ marginTop: '24px', padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
          進度查詢連結：<br/>
          <a href={`/status?appId=${result.applicationId}`} style={{ color: '#003366', wordBreak: 'break-all' }}>
            點擊查詢進度
          </a>
        </p>
      </div>
    );
  }

  const badgeCategories = ['技能', '服務', '教導', '興趣', '體適能'];
  const applicationModes = [
    { value: 'DISTRICT_ASSIGN', label: '由區會委派主考' },
    { value: 'SELF_EXAMINER', label: '自行安排主考' },
    { value: 'TRAINING_COURSE', label: '已完成認可訓練班' }
  ];

  const groupOptions = [
    { id: 'G-015', name: '港島第十五旅 (15th)' },
    { id: 'G-017', name: '港島第十七旅 (17th)' },
    { id: 'G-081', name: '港島第八十一旅 (81st)' },
    { id: 'G-082', name: '港島第八十二旅 (82nd)' },
    { id: 'G-206', name: '港島第二零六旅 (206th)' },
    { id: 'G-242', name: '港島第二四二旅 (242nd)' },
    { id: 'G-1095', name: '港島第一零九五旅 (1095th)' },
  ];

  return (
    <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
      <h2 style={{ color: '#003366', marginTop: 0 }}>📝 專科徽章報考申請</h2>
      
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="個人資料">
          <Row>
            <Input label="中文姓名 *" value={form.memberName} onChange={v => setForm({...form, memberName: v})} required />
            <Input label="英文姓名" value={form.memberNameEn} onChange={v => setForm({...form, memberNameEn: v})} />
          </Row>
          <Row>
            <Select label="所屬旅團 *" value={form.groupId} onChange={v => setForm({...form, groupId: v})} required
              options={groupOptions.map(g => ({ value: g.id, label: g.name }))} />
            <Input label="YMIS 會員編號" value={form.ymNumber} onChange={v => setForm({...form, ymNumber: v})} />
          </Row>
          <Row>
            <Input label="聯絡電話 *" value={form.phone} onChange={v => setForm({...form, phone: v})} required />
            <Input label="電郵地址 *" value={form.email} onChange={v => setForm({...form, email: v})} type="email" required />
          </Row>
        </Section>

        <Section title="專科徽章資料">
          <Row>
            <Input label="專章名稱 *" value={form.badgeName} onChange={v => setForm({...form, badgeName: v})} required 
              placeholder="例如：急救、露營、先鋒工程" />
            <Select label="專章類別" value={form.badgeCategory} onChange={v => setForm({...form, badgeCategory: v})}
              options={badgeCategories.map(c => ({ value: c, label: c }))} />
          </Row>
        </Section>

        <Section title="考核安排">
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>報考方式 *</label>
            {applicationModes.map(mode => (
              <label key={mode.value} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="mode" 
                  value={mode.value}
                  checked={form.applicationMode === mode.value}
                  onChange={() => setForm({...form, applicationMode: mode.value, selfExaminerName: ''})}
                  style={{ marginRight: '8px' }}
                />
                {mode.label}
              </label>
            ))}
          </div>

          {form.applicationMode === 'SELF_EXAMINER' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>自行安排主考姓名</label>
              <input 
                value={form.selfExaminerName}
                onChange={e => setForm({...form, selfExaminerName: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                placeholder="請輸入主考姓名，系統將核實其資格"
              />
              <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                請確認主考已於筲箕灣區主考名單內並持有此專章資格。
              </p>
            </div>
          )}
        </Section>

        <Section title="備註">
          <textarea
            value={form.remarks}
            onChange={e => setForm({...form, remarks: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px' }}
            placeholder="如有特殊情況請在此說明"
          />
        </Section>

        <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          <strong>⚠️ 重要提醒：</strong><br/>
          1. 每人同一時間最多報考兩項專科徽章。<br/>
          2. 考核須於獲批核後三個月內完成。<br/>
          3. 提交後系統將自動通知家長及團長。
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%', padding: '14px', background: loading ? '#ccc' : '#003366',
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '提交中...' : '提交申請'}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #eee' }}>
      <h3 style={{ color: '#003366', fontSize: '16px', marginBottom: '16px' }}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, required, type = 'text', placeholder }: any) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>
        {label} {required && <span style={{ color: '#c62828' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
      />
    </div>
  );
}

function Select({ label, value, onChange, required, options }: any) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>
        {label} {required && <span style={{ color: '#c62828' }}>*</span>}
      </label>
      <select
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: 'white' }}
      >
        <option value="">請選擇...</option>
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}