import { useEffect, useState } from 'react';
import { api, go } from './api.js';
import { Dashboard, Tracker, Insights, Learn, Doctor, Consent } from './pages.jsx';
import Connect from './Connect.jsx';

const INTERESTS = [
  ['pcos', 'PCOS & PCOD', 'Hormonal changes that can affect periods, skin, hair growth and fertility.'],
  ['menstrual', 'Menstrual health', 'Understand cycle patterns, period symptoms and when bleeding or pain needs attention.'],
  ['endo', 'Endometriosis', 'Learn about pelvic pain, symptoms that may be linked to endometriosis and seeking care.'],
  ['pregnancy', 'Pregnancy & reproductive health', 'Information about pregnancy signs, planning and getting early antenatal care.'],
  ['menopause', 'Menopause', 'Explore perimenopause, common changes and options to discuss with a clinician.'],
  ['anemia', 'Anaemia & hormones', 'Learn how low iron and thyroid conditions can affect energy, hair and menstrual cycles.']
];
const PRIVATE = ['dashboard', 'track', 'insights', 'doctor'];

function usePage() {
  const [p, setP] = useState(location.hash.slice(1) || 'home');
  useEffect(() => {
    const f = () => setP(location.hash.slice(1) || 'home');
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return p;
}

function Landing() {
  const features = [
    ['Symptom tracking', 'Log cramps, fatigue, headaches and more, plus your cycle dates, in under a minute.'],
    ['Health insights', 'Spot recurring patterns and see what they could be linked to, explained in plain words.'],
    ['Health education', 'Verified guides on PCOS, periods, endometriosis, pregnancy, menopause and anaemia.']
  ];
  return (
    <>
      <section className="hero">
        <h1>Your body talks.<br />HerHealth helps you listen.</h1>
        <p>Track how you feel, notice patterns over time, and walk into the doctor's office with clear answers.</p>
        <div className="row">
          <button className="btn" onClick={() => go('register')}>Create free account</button>
          <button className="btn ghost" onClick={() => go('login')}>Log in</button>
        </div>
      </section>
      <section className="cards3">
        {features.map(([t, d]) => (
          <article className="card feature" key={t}><h3>{t}</h3><p>{d}</p></article>
        ))}
      </section>
      <section className="card notice">
        <h3>Your privacy, your choice</h3>
        <p>We ask for your consent before saving any health information. You can delete your account and all of your data at any time.</p>
        <h3>Medical disclaimer</h3>
        <p>HerHealth gives general information only. It cannot diagnose or treat any condition. For diagnosis and treatment, always see a qualified doctor.</p>
      </section>
    </>
  );
}

function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }

function Register({ onAuth }) {
  const [f, setF] = useState({ name: '', email: '', password: '', dob: '', preferences: [] });
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const toggle = id => setF({ ...f, preferences: f.preferences.includes(id) ? f.preferences.filter(x => x !== id) : [...f.preferences, id] });

  async function submit(e) {
    e.preventDefault(); setErr('');
    try { const d = await api.register(f); localStorage.setItem('token', d.token); onAuth(d.user); go('dashboard'); }
    catch (x) { setErr(x.message); }
  }
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Create your account</h2>
      <p className="muted">Create a private space to track symptoms, notice patterns and explore trusted health guides. Before using symptom tracking, you can review and choose whether to consent to saving health entries.</p>
      <Field label="Name"><input value={f.name} onChange={set('name')} required /></Field>
      <Field label="Email"><input type="email" value={f.email} onChange={set('email')} required /></Field>
      <Field label="Password (8+ characters)"><input type="password" minLength={8} value={f.password} onChange={set('password')} required /></Field>
      <Field label="Date of birth"><input type="date" value={f.dob} max={new Date().toISOString().slice(0, 10)} onChange={set('dob')} required /></Field>
      <fieldset>
        <legend>What would you like to learn about? (optional)</legend>
        <div className="chips interests">
          {INTERESTS.map(([id, label, description]) => (
            <label key={id} className={'interest-option' + (f.preferences.includes(id) ? ' on' : '')}>
              <input type="checkbox" checked={f.preferences.includes(id)} onChange={() => toggle(id)} />
              <span><b>{label}</b><small>{description}</small></span>
            </label>
          ))}
        </div>
      </fieldset>
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn">Create account</button>
      <button type="button" className="textbtn" onClick={() => go('login')}>I already have an account</button>
    </form>
  );
}

function Login({ onAuth }) {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault(); setErr('');
    try { const d = await api.login(f); localStorage.setItem('token', d.token); onAuth(d.user); go('dashboard'); }
    catch (x) { setErr(x.message); }
  }
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Welcome back</h2>
      <p className="muted">Log in to review your symptom history, cycle patterns, reminders and health guides.</p>
      <Field label="Email"><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required /></Field>
      <Field label="Password"><input type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required /></Field>
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn">Log in</button>
      <button type="button" className="textbtn" onClick={() => go('forgot')}>Forgot password?</button>
      <button type="button" className="textbtn" onClick={() => go('register')}>Create an account</button>
    </form>
  );
}

function Forgot() {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ email: '', code: '', password: '' });
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr('');
    try {
      if (step === 1) { await api.forgot(f.email); setStep(2); }
      else { await api.reset(f); setStep(3); }
    } catch (x) { setErr(x.message); }
  }
  if (step === 3) return (
    <div className="card auth"><h2>Password updated</h2><button className="btn" onClick={() => go('login')}>Log in</button></div>
  );
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Reset your password</h2>
      <Field label="Email"><input type="email" value={f.email} onChange={set('email')} required disabled={step === 2} /></Field>
      {step === 2 && <>
        <p className="muted">We created a 6-digit code. Because no email service is connected, it is shown in the server terminal window.</p>
        <Field label="6-digit code"><input value={f.code} onChange={set('code')} inputMode="numeric" required /></Field>
        <Field label="New password (8+ characters)"><input type="password" minLength={8} value={f.password} onChange={set('password')} required /></Field>
      </>}
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn">{step === 1 ? 'Get reset code' : 'Save new password'}</button>
      <button type="button" className="textbtn" onClick={() => go('login')}>Back to log in</button>
    </form>
  );
}

export default function App() {
  const page = usePage();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.me().then(d => setUser(d.user)).catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);

  const logout = () => { localStorage.removeItem('token'); setUser(null); go('home'); };
  if (!ready) return <p className="loading">Loading…</p>;

  const nav = user
    ? [['dashboard', 'Home'], ['track', 'Track'], ['insights', 'Insights'], ['learn', 'Learn'], ['doctor', 'Doctor'], ['connect', 'SHEALTH Connect']]
    : [['learn', 'Learn'], ['connect', 'SHEALTH Connect']];

  let view;
  if (page === 'register' && !user) view = <Register onAuth={setUser} />;
  else if (page === 'login' && !user) view = <Login onAuth={setUser} />;
  else if (page === 'forgot' && !user) view = <Forgot />;
  else if (page === 'learn') view = <Learn interests={user?.preferences} />;
  else if (page === 'connect' && (!user || user.consent)) view = <Connect />;
  else if (!user) view = page === 'home' ? <Landing /> : <Login onAuth={setUser} />;
  else if (!user.consent) view = <Consent onDone={setUser} onDecline={logout} />;
  else if (page === 'track') view = <Tracker />;
  else if (page === 'insights') view = <Insights />;
  else if (page === 'doctor') view = <Doctor />;
  else view = <Dashboard user={user} />;

  return (
    <>
      <header className="top">
        <button className="brand" onClick={() => go(user ? 'dashboard' : 'home')}>HerHealth</button>
        <nav>
          {nav.map(([id, label]) => <button key={id} className={page === id || (id === 'dashboard' && page === 'home') ? 'on' : ''} onClick={() => go(id)}>{label}</button>)}
          {user ? <button onClick={logout}>Log out</button> : <><button onClick={() => go('login')}>Log in</button><button className="solid" onClick={() => go('register')}>Register</button></>}
        </nav>
      </header>
      <main>{view}</main>
      <footer>HerHealth shares general information only and cannot diagnose or treat. In an emergency, call your local emergency number.</footer>
    </>
  );
}
