import { useEffect, useState } from 'react';

const token = () => localStorage.getItem('token');
export const go = p => { location.hash = p; window.scrollTo(0, 0); };
export const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };

async function request(path, opts = {}) {
  const res = await fetch('/api' + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: 'Bearer ' + token() } : {}) }
  });
  if (!res.ok) {
    const msg = (await res.json().catch(() => ({}))).error || 'Something went wrong. Please try again.';
    if (res.status === 401 && token() && !path.startsWith('/auth')) { localStorage.removeItem('token'); location.reload(); }
    throw new Error(msg);
  }
  return res;
}
const json = async (p, o) => (await request(p, o)).json();
const post = (p, b) => json(p, { method: 'POST', body: JSON.stringify(b) });

export const api = {
  register: b => post('/auth/register', b),
  login: b => post('/auth/login', b),
  forgot: email => post('/auth/forgot', { email }),
  reset: b => post('/auth/reset', b),
  me: () => json('/me'),
  consent: consent => post('/me/consent', { consent }),
  deleteAccount: () => json('/me', { method: 'DELETE' }),
  articles: () => json('/articles'),
  symptoms: () => json('/symptoms'),
  addSymptom: b => post('/symptoms', b),
  removeSymptom: id => json('/symptoms/' + id, { method: 'DELETE' }),
  reminders: () => json('/reminders'),
  addReminder: b => post('/reminders', b),
  removeReminder: id => json('/reminders/' + id, { method: 'DELETE' }),
  insights: () => json('/insights'),
  async downloadReport() {
    const blob = await (await request('/report')).blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'herhealth-report.pdf';
    a.click();
    URL.revokeObjectURL(a.href);
  }
};

export function useData(fn, initial) {
  const [d, setD] = useState(initial);
  const load = () => fn().then(setD).catch(() => {});
  useEffect(() => { load(); }, []);
  return [d, load];
}
