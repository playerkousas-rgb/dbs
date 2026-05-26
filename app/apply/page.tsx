'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface FormState {
  memberName: string;
  memberNameEn: string;
  groupId: string;
  phone: string;
  email: string;
  ymNumber: string;
  badgeName: string;
  badgeCategory: string;
  examArrangementType: string;
  selfExaminerName: string;
  courseName: string;
  remarks: string;
}

export default function ApplyPage() {
  const [examiners, setExaminers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormState>({
    memberName: '',
    memberNameEn: '',
    groupId: '',
    phone: '',
    email: '',
    ymNumber: '',
    badgeName: '',
    badgeCategory: '技能',
    examArrangementType: 'SELF_APPLY',
    selfExaminerName: '',
    courseName: '',
    remarks: ''
  });

  useEffect(() => {
    api.getActiveExaminers().then((r: any) => {
      if (r.success) setExaminers(r.examiners || []);
    });
  }, []);

  const updateForm = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        memberName: form.memberName,
        memberNameEn: form.memberNameEn,
        groupId: form.groupId,
        phone: form.phone,
        email: form.email,
        ymNumber: form.ymNumber,
        badgeName: form.badgeName,
        badgeCategory: form.badgeCategory,
        examArrangementType: form.examArrangementType,
        selfExaminerName: form.selfExaminerName,
        courseName: form.courseName,
        remarks: form.remarks
      };
      const res = await api.submitApplication(payload);
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
          查詢驗證碼：<strong>{result.queryCode}</strong><br/>
          進度查詢連結：<br/>
          <a href={`/status?appId=${result.applicationId}`} style={{ color: '#003366', wordBreak: 'break-all' }}>
            點擊查詢進度
          </a>
        </p>
      </div>
    );
  }

  const badgeCategories = ['技能', '服務', '教導', '興趣', '體適能'];
  
  const arrangementOptions = [
    { value: 'SELF_APPLY', label: '童軍成員自行報考' },
    { value: 'APPROVED_COURSE', label: '認可訓練班' },
    { value: 'EXAM_DAY', label: '專章考驗日' },
    { value: 'OTHER_ARRANGEMENT', label: '其他安排' },
    { value: 'CERTIFICATE_EXCHANGE', label: '證書換專章' }
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

  const showSelfExaminer = form.examArrangementType === 'SELF_APPLY';
  const showCourseName = form.examArrangementType === 'APPROVED_COURSE' || form.examArrangementType === 'EXAM_DAY' || form.examArrangementType === 'OTHER_ARRANGEMENT';

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
            <Input label="中文姓名 *" value={form.memberName} onChange={(v: string) => updateForm('memberName', v)} required />
            <Input label="英文姓名" value={form.memberNameEn} onChange={(v: string) => updateForm('memberNameEn', v)} />
          </Row>
          <Row>
            <Select label="所屬旅團 *" value={form.groupId} onChange={(v: string) => updateForm('groupId', v)} required
              options={groupOptions.map(g => ({ value: g.id, label: g.name }))} />
            <Input label="YMIS 童軍成員編號 *" value={form.ymNumber} onChange={(v: string) => updateForm('ymNumber', v)} required />
          </Row>
          <Row>
            <Input label="聯絡電話 *" value={form.phone} onChange={(v: string) => updateForm('phone', v)} required />
            <Input label="電郵地址 *" value={form.email} onChange={(v: string) => updateForm('email', v)} type="email" required />
          </Row>
        </Section>

        <Section title="專科徽章資料">
          <Row>
            <Input label="專章名稱 *" value={form.badgeName} onChange={(v: string) => updateForm('badgeName', v)} required 
              placeholder="例如：急救、露營、先鋒工程" />
            <Select label="專章類別" value={form.badgeCategory} onChange={(v: string) => updateForm('badgeCategory', v)}
              options={badgeCategories.map(c => ({ value: c, label: c }))} />
          </Row>
        </Section>

        <Section title="考驗安排（依據 P120A1-09）">
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>考驗安排 *</label>
            {arrangementOptions.map(mode => (
              <label key={mode.value} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="arrangement" 
                  value={mode.value}
                  checked={form.examArrangementType === mode.value}
                  onChange={() => setForm(prev => ({ ...prev, examArrangementType: mode.value, selfExaminerName: '', courseName: '' }))}
                  style={{ marginRight: '8px' }}
                />
                {mode.label}
              </label>
            ))}
          </div>

          {showSelfExaminer && (
            <div style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>自行安排主考姓名</label>
              <input 
                value={form.selfExaminerName}
                onChange={e => updateForm('selfExaminerName', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                placeholder="請輸入主考姓名，系統將核實其資格"
              />
              <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                請確認主考已於筲箕灣區主考名單內並持有此專章資格。
              </p>
            </div>
          )}

          {showCourseName && (
            <div style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <Input 
                label={form.examArrangementType === 'APPROVED_COURSE' ? '訓練班名稱 / 主辦單位' : form.examArrangementType === 'EXAM_DAY' ? '考驗日名稱 / 主辦單位' : '詳細資料'}
                value={form.courseName} 
                onChange={(v: string) => updateForm('courseName', v)} 
                placeholder="請填寫名稱及主辦單位"
              />
            </div>
          )}
        </Section>

        <Section title="備註">
          <textarea
            value={form.remarks}
            onChange={e => updateForm('remarks', e.target.value)}
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

function Input({ label, value, onChange, required, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; placeholder?: string }) {
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

function Select({ label, value, onChange, required, options }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; options: { value: string; label: string }[] }) {
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
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}