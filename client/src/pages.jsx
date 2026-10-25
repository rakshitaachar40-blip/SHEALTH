import { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api, go, today, useData } from './api.js';

const TYPES = ['Cramps', 'Fatigue', 'Headache', 'Irregular periods', 'Heavy bleeding', 'Mood changes', 'Bloating', 'Pelvic pain', 'Acne', 'Hair loss', 'Nausea'];
const LABELS = { pcos: 'PCOS & PCOD', menstrual: 'Menstrual health', endo: 'Endometriosis', pregnancy: 'Pregnancy & reproductive health', menopause: 'Menopause', anemia: 'Anaemia & hormones' };
const LEVELS = { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' };
const SCORE = { mild: 1, moderate: 2, severe: 3 };
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

function Title({ children, sub }) {
  return <div className="title"><h1>{children}</h1>{sub && <p className="muted">{sub}</p>}</div>;
}
const Sev = ({ s }) => <span className={'pill ' + s}>{LEVELS[s]}</span>;

// ---------- Consent ----------
export function Consent({ onDone, onDecline }) {
  const [err, setErr] = useState('');
  async function agree() {
    try { onDone((await api.consent(true)).user); } catch (x) { setErr(x.message); }
  }
  return (
    <div className="card auth">
      <h2>Before we start</h2>
      <p>HerHealth will save the symptoms, cycle dates and notes you enter so it can show history and patterns. This is sensitive health information.</p>
      <ul className="plain">
        <li>It is stored only for your account and is never sold.</li>
        <li>You can delete your account and all data at any time from the Home page.</li>
        <li>Insights are general information, not a diagnosis.</li>
      </ul>
      {err && <p className="error">{err}</p>}
      <button className="btn" onClick={agree}>I agree, continue</button>
      <button className="textbtn" onClick={onDecline}>No thanks, log me out</button>
    </div>
  );
}

// ---------- Dashboard ----------
export function Dashboard({ user }) {
  const [symptoms, reloadS] = useData(api.symptoms, []);
  const [reminders, reloadR] = useData(api.reminders, []);
  const [f, setF] = useState({ title: '', date: today(), time: '', kind: 'log' });
  const [err, setErr] = useState('');

  const t = today();
  const todays = symptoms.filter(s => s.date === t);
  const lastPeriod = symptoms.filter(s => s.periodStart).map(s => s.date).sort().at(-1);
  const upcoming = reminders.filter(r => r.date >= t).slice(0, 4);
  const dueToday = reminders.filter(r => r.date === t);

  async function addReminder(e) {
    e.preventDefault(); setErr('');
    try { await api.addReminder(f); setF({ ...f, title: '' }); reloadR(); } catch (x) { setErr(x.message); }
  }
  async function wipe() {
    if (confirm('Delete your account and all of your health data? This cannot be undone.')) {
      await api.deleteAccount(); localStorage.removeItem('token'); location.hash = 'home'; location.reload();
    }
  }

  return (
    <>
      <Title sub={new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}>Hi {user.name.split(' ')[0]}</Title>
      {dueToday.length > 0 && <div className="card banner">Today: {dueToday.map(r => r.title).join(', ')}</div>}

      <section className="stats">
        <div className="card stat"><b>{todays.length}</b><span>{todays.length ? 'symptoms logged today' : 'Nothing logged today yet. How are you feeling?'}</span></div>
        <div className="card stat"><b>{lastPeriod ? 'Day ' + (daysBetween(lastPeriod, t) + 1) : '—'}</b><span>{lastPeriod ? 'of your cycle (from your last period start)' : 'Log a period start to see your cycle day'}</span></div>
        <div className="card stat"><b>{upcoming.length}</b><span>upcoming reminder{upcoming.length === 1 ? '' : 's'}</span></div>
      </section>

      <section className="quick">
        <button className="btn" onClick={() => go('track')}>Log a symptom</button>
        <button className="btn lilac" onClick={() => go('insights')}>View insights</button>
        <button className="btn peach" onClick={() => go('learn')}>Learn</button>
        <button className="btn ghost" onClick={() => go('doctor')}>Doctor support</button>
      </section>

      <div className="two">
        <section className="card">
          <h3>Recent symptoms</h3>
          {!symptoms.length && <p className="muted">Nothing here yet. Log your first symptom to get started.</p>}
          <ul className="list">
            {symptoms.slice(0, 5).map(s => (
              <li key={s.id}><div><b>{s.type}</b><small>{s.date}</small></div><Sev s={s.severity} /></li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h3>Reminders</h3>
          <ul className="list">
            {upcoming.map(r => (
              <li key={r.id}><div><b>{r.title}</b><small>{r.date}{r.time && ' at ' + r.time}</small></div>
                <button className="textbtn" onClick={() => api.removeReminder(r.id).then(reloadR)}>Remove</button></li>
            ))}
            {!upcoming.length && <li className="muted">No upcoming reminders.</li>}
          </ul>
          <form className="miniform" onSubmit={addReminder}>
            <input placeholder="e.g. Log symptoms, or Dr. appointment" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required />
            <div className="row">
              <input type="date" min={t} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} required />
              <input type="time" value={f.time} onChange={e => setF({ ...f, time: e.target.value })} />
              <select value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}><option value="log">Log</option><option value="appointment">Appointment</option></select>
            </div>
            {err && <p className="error">{err}</p>}
            <button className="btn small">Add reminder</button>
          </form>
        </section>
      </div>

      {user.preferences?.length > 0 && (
        <section className="card"><h3>Your interests</h3>
          <div className="chips">{user.preferences.map(p => <button key={p} className="chip on" onClick={() => go('learn')}>{LABELS[p] || p}</button>)}</div>
        </section>
      )}
      <p className="center"><button className="textbtn" onClick={wipe}>Delete my account and data</button></p>
    </>
  );
}

// ---------- Calendar ----------
function Calendar({ entries }) {
  const [m, setM] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [sel, setSel] = useState(today());
  const y = m.getFullYear(), mo = m.getMonth();
  const lead = new Date(y, mo, 1).getDay(), days = new Date(y, mo + 1, 0).getDate();
  const key = d => `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const by = {};
  entries.forEach(e => (by[e.date] ||= []).push(e));
  const worst = l => (l.some(e => e.severity === 'severe') ? 'severe' : l.some(e => e.severity === 'moderate') ? 'moderate' : 'mild');
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  return (
    <section className="card">
      <div className="calhead">
        <button className="textbtn" aria-label="Previous month" onClick={() => setM(new Date(y, mo - 1, 1))}>‹</button>
        <h3>{m.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
        <button className="textbtn" aria-label="Next month" onClick={() => setM(new Date(y, mo + 1, 1))}>›</button>
      </div>
      <div className="cal">
        {'SMTWTFS'.split('').map((d, i) => <span key={i} className="dow">{d}</span>)}
        {cells.map((d, i) => d === null ? <span key={i} /> : (
          <button key={i} className={'day' + (key(d) === sel ? ' sel' : '') + (key(d) === today() ? ' today' : '')} onClick={() => setSel(key(d))}>
            {d}
            {by[key(d)] && <i className={'dot ' + worst(by[key(d)])} />}
            {by[key(d)]?.some(e => e.periodStart) && <em>Period</em>}
          </button>
        ))}
      </div>
      <div className="legend"><span><i className="dot mild" /> mild</span><span><i className="dot moderate" /> moderate</span><span><i className="dot severe" /> severe</span><span>Period start</span></div>
      <h4>{sel}</h4>
      {(by[sel] || []).map(e => <p key={e.id} className="daynote"><b>{e.type}</b> <Sev s={e.severity} /> {e.duration && <small>{e.duration}</small>} {e.notes && <small>· {e.notes}</small>}</p>)}
      {!by[sel] && <p className="muted">No entries on this day.</p>}
    </section>
  );
}

// ---------- Tracker ----------
export function Tracker() {
  const [items, reload] = useData(api.symptoms, []);
  const [f, setF] = useState({ type: '', severity: 'mild', date: today(), duration: 'A few hours', notes: '', periodStart: false });
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr('');
    try { await api.addSymptom(f); setF({ ...f, type: '', notes: '', periodStart: false }); reload(); } catch (x) { setErr(x.message); }
  }

  const freq = useMemo(() => {
    const m = {};
    items.forEach(i => { const k = i.type.toLowerCase(); m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [items]);
  const series = useMemo(() => {
    const m = {};
    items.forEach(i => (m[i.date] ||= []).push(SCORE[i.severity]));
    return Object.entries(m).sort().map(([date, v]) => ({ date, severity: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) }));
  }, [items]);

  return (
    <>
      <Title sub="Log what you feel. Patterns show up over time.">Symptom tracker</Title>
      <div className="two">
        <form className="card" onSubmit={submit}>
          <h3>New entry</h3>
          <label className="field"><span>Symptom</span>
            <input list="types" value={f.type} onChange={set('type')} placeholder="Choose or type your own" required />
            <datalist id="types">{TYPES.map(t => <option key={t} value={t} />)}</datalist>
          </label>
          <div className="field"><span>Severity</span>
            <div className="seg">{Object.entries(LEVELS).map(([k, v]) => (
              <label key={k} className={'segopt ' + k + (f.severity === k ? ' on' : '')}>
                <input type="radio" name="sev" checked={f.severity === k} onChange={() => setF({ ...f, severity: k })} />{v}
              </label>))}
            </div>
          </div>
          <div className="row">
            <label className="field"><span>Date</span><input type="date" max={today()} value={f.date} onChange={set('date')} required /></label>
            <label className="field"><span>How long?</span>
              <select value={f.duration} onChange={set('duration')}>
                {['A few minutes', 'A few hours', 'All day', '2 to 3 days', 'More than 3 days'].map(d => <option key={d}>{d}</option>)}
              </select></label>
          </div>
          <label className="field"><span>Notes (optional)</span><textarea rows="2" value={f.notes} onChange={set('notes')} placeholder="Food, sleep, stress, medicine taken…" /></label>
          <label className="check"><input type="checkbox" checked={f.periodStart} onChange={e => setF({ ...f, periodStart: e.target.checked })} /> My period started on this date</label>
          {err && <p className="error" role="alert">{err}</p>}
          <button className="btn">Save entry</button>
        </form>
        <Calendar entries={items} />
      </div>

      {items.length > 0 && (
        <section className="card">
          <h3>Patterns</h3>
          <div className="two">
            <div><h4>How often</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={freq} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={110} />
                  <Tooltip /><Bar dataKey="count" fill="#E8467F" radius={8} />
                </BarChart>
              </ResponsiveContainer></div>
            <div><h4>Average severity over time</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={series}>
                  <CartesianGrid stroke="#f3d4e3" /><XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[1, 3]} ticks={[1, 2, 3]} tickFormatter={v => ['', 'Mild', 'Mod.', 'Severe'][v]} width={50} />
                  <Tooltip /><Line dataKey="severity" stroke="#7C5CC4" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer></div>
          </div>
        </section>
      )}

      <section className="card">
        <h3>History</h3>
        {!items.length && <p className="muted">No entries yet. Your first entry will appear here.</p>}
        <ul className="list">
          {items.map(s => (
            <li key={s.id}><div><b>{s.type}</b> {s.periodStart && <span className="pill mild">Period start</span>}<small>{s.date} · {s.duration}{s.notes && ' · ' + s.notes}</small></div>
              <div className="row"><Sev s={s.severity} /><button className="textbtn" onClick={() => api.removeSymptom(s.id).then(reload)}>Remove</button></div></li>
          ))}
        </ul>
      </section>
    </>
  );
}

// ---------- Insights ----------
export function Insights() {
  const [d] = useData(api.insights, null);
  if (!d) return <p className="loading">Reading your patterns…</p>;
  const recurring = d.patterns.filter(p => p.recurring);

  return (
    <>
      <Title sub="Based on the last 90 days of your entries.">Health insights</Title>
      {d.seekCare && (
        <div className="card alert">
          <h3>Worth talking to a doctor</h3>
          <ul className="plain">{d.reasons.map(r => <li key={r}>{r}</li>)}</ul>
          <p>This does not mean something is wrong. A doctor can look into it properly. Insights here are not a diagnosis.</p>
          <button className="btn small" onClick={() => go('doctor')}>Get my doctor report</button>
        </div>
      )}

      <section className="card">
        <h3>Recurring symptoms</h3>
        {!recurring.length && <p className="muted">Log the same symptom 3 or more times to see patterns here.</p>}
        <div className="cards3">
          {recurring.map(p => (
            <div key={p.name} className="mini">
              <b>{p.name}</b>
              <span>{p.count} times · {p.avg}/3 average</span>
              <span className={'trend ' + p.trend.replace(' ', '')}>{p.trend}{p.persistent && ' · persistent'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Your cycle</h3>
        {d.cycle.lastStart
          ? <p>Last period started <b>{d.cycle.lastStart}</b>.{d.cycle.avgLength && <> Your average cycle is about <b>{d.cycle.avgLength} days</b>{d.cycle.irregular && ', and it varies quite a bit'}.</>}</p>
          : <p className="muted">Tick “My period started on this date” when you log to see your cycle length.</p>}
      </section>

      {d.explanation && <section className="card ai"><h3>Summary in plain words</h3><p>{d.explanation}</p><small>AI-written from verified content. Informational only.</small></section>}

      {d.topics.length > 0 && (
        <section className="card">
          <h3>What this could be linked to</h3>
          <p className="muted">These are possibilities from general medical information, not a diagnosis.</p>
          {d.topics.map(x => (
            <div key={x.id} className="topic"><h4>{x.title}</h4><p>{x.text}</p><small className="source-label"><b>Source:</b> {x.source}</small>
              {!!x.sourceLinks?.length && <small className="source-label"><b>Further reading:</b> {x.sourceLinks.map((source, i) => (
                <span key={source.url}>{i > 0 && ' · '}<a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></span>
              ))}</small>}
              <button className="textbtn" onClick={() => go('learn')}>Read more</button></div>
          ))}
        </section>
      )}
    </>
  );
}

// ---------- Learn ----------
export function Learn({ interests = [] }) {
  const [d] = useData(api.articles, { articles: [], urgentSigns: [] });
  const [open, setOpen] = useState(null);
  const list = [...d.articles].sort((a, b) => interests.includes(b.id) - interests.includes(a.id));

  return (
    <>
      <Title sub="Plain-language guides based on WHO and NHS information.">Health education</Title>
      <div className="cards3">
        {list.map(a => (
          <button
            key={a.id}
            className={'card topiccard' + (open === a.id ? ' on' : '')}
            onClick={() => setOpen(open === a.id ? null : a.id)}
            aria-expanded={open === a.id}
            aria-controls={'article-' + a.id}
          >
            <h3>{a.title}</h3>
          </button>
        ))}
      </div>
      {list.filter(a => a.id === open).map(a => (
        <article key={a.id} id={'article-' + a.id} className="card article">
          <h2>{a.title}</h2>
          <p>{a.about}</p>
          {(a.sections || []).map(section => (
            <section key={section.heading}>
              <h4>{section.heading}</h4>
              <p>{section.text}</p>
            </section>
          ))}
          {a.details && (
            <section>
              <h4>More about this topic</h4>
              <p>{a.details}</p>
            </section>
          )}
          <div className="two">
            <div><h4>Common symptoms</h4><ul>{a.symptoms.map(s => <li key={s}>{s}</li>)}</ul></div>
            <div><h4>When to seek medical care</h4><ul>{a.seeDoctor.map(s => <li key={s}>{s}</li>)}</ul></div>
          </div>
          <h4>Myth vs fact</h4>
          {a.myths.map(m => <div key={m.myth} className="myth"><p><b>Myth:</b> {m.myth}</p><p><b>Fact:</b> {m.fact}</p></div>)}
          <small className="source-label"><b>Source:</b> {a.source}</small>
          {!!a.sourceLinks?.length && <small className="source-label"><b>Further reading:</b> {a.sourceLinks.map((source, i) => (
            <span key={source.url}>{i > 0 && ' · '}<a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></span>
          ))}</small>}
        </article>
      ))}
    </>
  );
}

// ---------- Doctor support ----------
export function Doctor() {
  const [ins] = useData(api.insights, null);
  const [d] = useData(api.articles, { articles: [], urgentSigns: [] });
  const [err, setErr] = useState('');

  return (
    <>
      <Title sub="Go to your appointment prepared.">Doctor support</Title>
      <section className="card">
        <h3>Symptom report</h3>
        <p>A PDF with your cycle, symptom summary, full log and questions to ask. Share it with your doctor.</p>
        {err && <p className="error">{err}</p>}
        <button className="btn" onClick={() => api.downloadReport().catch(x => setErr(x.message))}>Download report (PDF)</button>
      </section>

      <section className="card">
        <h3>Questions to ask during your visit</h3>
        <ul>{(ins?.questions || ['Which tests do you recommend for me?', 'What can I do at home to ease these symptoms?']).map(q => <li key={q}>{q}</li>)}</ul>
      </section>

      <section className="card alert">
        <h3>Get urgent medical help if you have</h3>
        <ul>{d.urgentSigns.map(s => <li key={s}>{s}</li>)}</ul>
      </section>

      <p className="muted center">Diagnosis and treatment must come from a qualified healthcare professional.</p>
    </>
  );
}
