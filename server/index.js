import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import { data, save } from './db.js';
import { ARTICLES, URGENT_SIGNS, matchTopics } from './articles.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DAY = 864e5;
const SCORE = { mild: 1, moderate: 2, severe: 3 };
const uid = () => crypto.randomUUID();
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(Date.parse(s));
const clean = u => ({ id: u.id, name: u.name, email: u.email, dob: u.dob, preferences: u.preferences, consent: !!u.consent });
const ageOf = dob => Math.floor((Date.now() - Date.parse(dob)) / (365.25 * DAY));
const sign = u => jwt.sign({ id: u.id }, SECRET, { expiresIn: '7d' });

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Auth middleware ----------
function auth(req, res, next) {
  try {
    const { id } = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET);
    req.user = data.users.find(u => u.id === id);
    if (!req.user) throw new Error('no user');
    next();
  } catch {
    res.status(401).json({ error: 'Please log in again.' });
  }
}
const consented = (req, res, next) =>
  req.user.consent ? next() : res.status(403).json({ error: 'Please give consent before using health tracking.' });

// ---------- Public ----------
app.get('/api/articles', (_req, res) => res.json({ articles: ARTICLES, urgentSigns: URGENT_SIGNS }));

// ---------- Auth ----------
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, dob, preferences = [] } = req.body || {};
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 8)
    return res.status(400).json({ error: 'Enter your name, a valid email and a password of at least 8 characters.' });
  if (!isDate(dob) || Date.parse(dob) > Date.now())
    return res.status(400).json({ error: 'Enter a valid date of birth.' });
  if (data.users.some(u => u.email === email.toLowerCase()))
    return res.status(409).json({ error: 'An account with this email already exists.' });
  const user = {
    id: uid(), name: name.trim(), email: email.toLowerCase(), dob,
    preferences: Array.isArray(preferences) ? preferences.slice(0, 10) : [],
    passwordHash: await bcrypt.hash(password, 12), consent: false
  };
  data.users.push(user);
  save();
  res.json({ token: sign(user), user: clean(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const user = data.users.find(u => u.email === email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  res.json({ token: sign(user), user: clean(user) });
});

app.post('/api/auth/forgot', (req, res) => {
  const email = (req.body?.email || '').toLowerCase();
  if (data.users.some(u => u.email === email)) {
    const code = String(crypto.randomInt(100000, 1000000));
    data.resets = data.resets.filter(r => r.email !== email);
    data.resets.push({ email, code, expires: Date.now() + 15 * 60e3 });
    save();
    console.log(`\n[HerHealth] Password reset code for ${email}: ${code} (valid 15 minutes)\n`);
  }
  res.json({ ok: true });
});

app.post('/api/auth/reset', async (req, res) => {
  const { email = '', code = '', password = '' } = req.body || {};
  const r = data.resets.find(x => x.email === email.toLowerCase() && x.code === code && x.expires > Date.now());
  const user = data.users.find(u => u.email === email.toLowerCase());
  if (!r || !user || password.length < 8)
    return res.status(400).json({ error: 'The code is wrong or expired, or the new password is under 8 characters.' });
  user.passwordHash = await bcrypt.hash(password, 12);
  data.resets = data.resets.filter(x => x !== r);
  save();
  res.json({ ok: true });
});

app.get('/api/me', auth, (req, res) => res.json({ user: clean(req.user) }));

app.post('/api/me/consent', auth, (req, res) => {
  req.user.consent = !!req.body?.consent;
  req.user.consentAt = new Date().toISOString();
  save();
  res.json({ user: clean(req.user) });
});

app.delete('/api/me', auth, (req, res) => {
  data.symptoms = data.symptoms.filter(s => s.user !== req.user.id);
  data.reminders = data.reminders.filter(r => r.user !== req.user.id);
  data.users = data.users.filter(u => u.id !== req.user.id);
  save();
  res.json({ ok: true });
});

// ---------- Symptoms ----------
const mine = (list, req) => list.filter(x => x.user === req.user.id);

app.get('/api/symptoms', auth, consented, (req, res) =>
  res.json(mine(data.symptoms, req).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))));

app.post('/api/symptoms', auth, consented, (req, res) => {
  const { type, severity, date, duration = '', notes = '', periodStart = false } = req.body || {};
  if (!type?.trim() || !SCORE[severity] || !isDate(date))
    return res.status(400).json({ error: 'Choose a symptom, how severe it is, and a date.' });
  const s = {
    id: uid(), user: req.user.id, type: type.trim().slice(0, 60), severity, date,
    duration: String(duration).slice(0, 40), notes: String(notes).slice(0, 500),
    periodStart: !!periodStart, createdAt: new Date().toISOString()
  };
  data.symptoms.push(s);
  save();
  res.json(s);
});

app.delete('/api/symptoms/:id', auth, (req, res) => {
  data.symptoms = data.symptoms.filter(s => !(s.id === req.params.id && s.user === req.user.id));
  save();
  res.json({ ok: true });
});

// ---------- Reminders ----------
app.get('/api/reminders', auth, (req, res) =>
  res.json(mine(data.reminders, req).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))));

app.post('/api/reminders', auth, (req, res) => {
  const { title, date, time = '', kind = 'log' } = req.body || {};
  if (!title?.trim() || !isDate(date)) return res.status(400).json({ error: 'Add a title and a date for the reminder.' });
  const r = { id: uid(), user: req.user.id, title: title.trim().slice(0, 80), date, time, kind };
  data.reminders.push(r);
  save();
  res.json(r);
});

app.delete('/api/reminders/:id', auth, (req, res) => {
  data.reminders = data.reminders.filter(r => !(r.id === req.params.id && r.user === req.user.id));
  save();
  res.json({ ok: true });
});

// ---------- Analysis ----------
const mean = a => (a.length ? a.reduce((s, x) => s + SCORE[x.severity], 0) / a.length : 0);
const t = d => Date.parse(d);

function analyze(entries) {
  const groups = {};
  entries.filter(e => !(e.periodStart && e.type === 'Period start')).forEach(e => (groups[e.type.toLowerCase()] ||= []).push(e));

  const patterns = Object.entries(groups).map(([name, list]) => {
    list.sort((a, b) => a.date.localeCompare(b.date));
    const half = Math.floor(list.length / 2);
    const diff = mean(list.slice(half)) - mean(list.slice(0, half));
    const trend = list.length < 4 ? 'not enough data' : diff > 0.4 ? 'worsening' : diff < -0.4 ? 'improving' : 'steady';
    const spanDays = Math.round((t(list.at(-1).date) - t(list[0].date)) / DAY);
    return {
      name, count: list.length, avg: +mean(list).toFixed(1), trend,
      recurring: list.length >= 3, persistent: list.length >= 3 && spanDays >= 14,
      first: list[0].date, last: list.at(-1).date
    };
  }).sort((a, b) => b.count - a.count);

  const starts = [...new Set(entries.filter(e => e.periodStart).map(e => e.date))].sort();
  const gaps = starts.slice(1).map((d, i) => Math.round((t(d) - t(starts[i])) / DAY));
  const cycle = {
    lastStart: starts.at(-1) || null, gaps,
    avgLength: gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null,
    irregular: gaps.length >= 2 && (Math.min(...gaps) < 21 || Math.max(...gaps) > 35 || Math.max(...gaps) - Math.min(...gaps) > 7)
  };

  const severeRecent = entries.filter(e => t(e.date) > Date.now() - 30 * DAY && e.severity === 'severe').length;
  const reasons = [];
  if (severeRecent >= 2) reasons.push(`${severeRecent} severe entries in the last 30 days`);
  patterns.filter(p => p.recurring && p.trend === 'worsening').forEach(p => reasons.push(`${p.name} is getting worse over time`));
  patterns.filter(p => p.persistent && p.avg >= 2.5).forEach(p => reasons.push(`${p.name} keeps coming back and is often severe`));
  if (cycle.irregular) reasons.push('your cycle length varies a lot between periods');
  return { patterns, cycle, reasons: [...new Set(reasons)], seekCare: reasons.length > 0 };
}

function questionsFor({ patterns, cycle }) {
  const q = patterns.filter(p => p.recurring).slice(0, 3)
    .map(p => `My ${p.name} has been logged ${p.count} times (average ${p.avg} out of 3). What could be causing it?`);
  if (cycle.irregular) q.push('My cycle length varies a lot. Should I have hormone or thyroid tests?');
  q.push('Which tests or scans, if any, do you recommend for me?',
    'What can I do at home to ease these symptoms?',
    'Which warning signs mean I should come back sooner or go to emergency care?');
  return q;
}

async function aiSummary(patterns, topics) {
  if (!process.env.ANTHROPIC_API_KEY || !topics.length) return null;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 500,
        system: "You explain women's health patterns. Use ONLY the verified content given. Never diagnose, never name medicines or doses. Say these are possibilities, and when to see a doctor. Under 130 words, warm and plain.",
        messages: [{ role: 'user', content: `Recurring symptoms: ${JSON.stringify(patterns.filter(p => p.recurring))}\n\nVerified content:\n${topics.map(x => `- ${x.title}: ${x.text} (${x.source})`).join('\n')}` }]
      })
    });
    return (await r.json()).content?.map(c => c.text || '').join('') || null;
  } catch { return null; }
}

app.get('/api/insights', auth, consented, async (req, res) => {
  const entries = mine(data.symptoms, req).filter(e => t(e.date) >= Date.now() - 90 * DAY);
  const a = analyze(entries);
  const names = a.patterns.filter(p => p.recurring).map(p => p.name);
  if (a.cycle.irregular) names.push('irregular');
  const topics = matchTopics(names);
  res.json({ ...a, topics, questions: questionsFor(a), explanation: await aiSummary(a.patterns, topics), urgentSigns: URGENT_SIGNS });
});

// ---------- PDF report ----------
app.get('/api/report', auth, consented, (req, res) => {
  const entries = mine(data.symptoms, req).sort((a, b) => a.date.localeCompare(b.date));
  const a = analyze(entries);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="herhealth-report.pdf"');
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  const h = s => doc.moveDown().fontSize(13).fillColor('#B3175F').text(s).fillColor('#000').fontSize(10).moveDown(0.3);

  doc.fontSize(20).fillColor('#3D1B3A').text('HerHealth symptom report');
  doc.fontSize(10).fillColor('#555').text(`Name: ${req.user.name}   Age: ${ageOf(req.user.dob)}   Generated: ${new Date().toISOString().slice(0, 10)}`);

  h('Cycle');
  doc.text(a.cycle.lastStart
    ? `Last period start: ${a.cycle.lastStart}. Average cycle: ${a.cycle.avgLength ?? 'not enough data'} days${a.cycle.irregular ? ' (varies a lot)' : ''}.`
    : 'No period start dates logged.');

  h('Summary by symptom');
  if (!a.patterns.length) doc.text('No symptoms logged yet.');
  a.patterns.forEach(p => doc.text(`${p.name}: ${p.count} entries, average severity ${p.avg}/3, trend ${p.trend}, ${p.first} to ${p.last}`));

  if (a.seekCare) {
    h('Points to discuss');
    a.reasons.forEach(r => doc.fillColor('#A3203F').text(`- ${r}`));
    doc.fillColor('#000');
  }

  h('Questions to ask');
  questionsFor(a).forEach(q => doc.text(`- ${q}`));

  h('Full log (oldest first)');
  entries.forEach(e => doc.text(`${e.date} | ${e.type} | ${e.severity}${e.duration ? ' | ' + e.duration : ''}${e.periodStart ? ' | period started' : ''}${e.notes ? ' | ' + e.notes : ''}`));

  doc.moveDown(2).fontSize(8).fillColor('#666').text('Self-reported data from a symptom tracker. It is not a diagnosis. Please discuss it with a qualified doctor.');
  doc.end();
});

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Something went wrong on the server.' }); });
app.listen(process.env.PORT || 5000, () => console.log('HerHealth API running on port', process.env.PORT || 5000));
