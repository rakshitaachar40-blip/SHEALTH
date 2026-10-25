import { useMemo, useState } from 'react';
import './connect.css';

const DOCTORS = [
  { id: 'mira-sen', name: 'Mira Sen', specialty: 'Menstrual health', focus: 'Cycle questions and period concerns', about: 'A fictional profile for demonstrating how a person could explore menstrual health support.' },
  { id: 'leena-patel', name: 'Leena Patel', specialty: 'PCOS support', focus: 'Questions about PCOS and hormonal health', about: 'A fictional profile for demonstrating how a person could explore PCOS-related support.' },
  { id: 'nadiya-khan', name: 'Nadiya Khan', specialty: 'Endometriosis support', focus: 'Pelvic pain and endometriosis questions', about: 'A fictional profile for demonstrating how a person could explore pelvic health support.' },
  { id: 'tara-joseph', name: 'Tara Joseph', specialty: 'Pregnancy & reproductive health', focus: 'Reproductive health questions', about: 'A fictional profile for demonstrating how a person could explore reproductive health support.' },
  { id: 'maya-iyer', name: 'Maya Iyer', specialty: 'Menopause support', focus: 'Perimenopause and menopause questions', about: 'A fictional profile for demonstrating how a person could explore menopause support.' }
];

const SPECIALTIES = ['All specialties', ...new Set(DOCTORS.map(doctor => doctor.specialty))];

export default function Connect() {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [dialog, setDialog] = useState('');
  const [consultation, setConsultation] = useState({ mode: '', message: '' });
  const [formError, setFormError] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [demoConsent, setDemoConsent] = useState(false);

  const filteredDoctors = useMemo(() => DOCTORS.filter(doctor => {
    const matchesSpecialty = specialty === 'All specialties' || doctor.specialty === specialty;
    const terms = `${doctor.name} ${doctor.specialty} ${doctor.focus}`.toLowerCase();
    return matchesSpecialty && terms.includes(query.trim().toLowerCase());
  }), [query, specialty]);

  function closeDialog() {
    setDialog('');
    setFormError('');
  }

  function openProfile(doctor) {
    setSelectedDoctor(doctor);
    setRequestStatus('');
    setDialog('profile');
  }

  function openRequest() {
    setConsultation({ mode: '', message: '' });
    setFormError('');
    setRequestStatus('');
    setDialog('request');
  }

  function submitRequest(event) {
    event.preventDefault();
    if (!consultation.mode) {
      setFormError('Choose a consultation mode to continue.');
      return;
    }
    setRequestStatus(`Demo request prepared for ${selectedDoctor.name}. It was not sent, saved, or booked.`);
    setFormError('');
  }

  return (
    <div className="connect-page">
      <header className="connect-heading">
        <p className="connect-eyebrow">SUPPORT, ON YOUR TERMS</p>
        <h1>SHEALTH Connect</h1>
        <p>Your health journey, with the right support.</p>
        <span className="connect-demo-label">All profiles are fictional demonstration profiles</span>
      </header>

      <section className="connect-search" aria-label="Find a demonstration profile">
        <label className="connect-control">
          <span>Search profiles</span>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, specialty, or topic" />
        </label>
        <label className="connect-control">
          <span>Specialty</span>
          <select value={specialty} onChange={event => setSpecialty(event.target.value)}>
            {SPECIALTIES.map(item => <option key={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <section className="connect-doctors" aria-label="Demonstration profiles">
        <div className="connect-section-title">
          <h2>Explore support</h2>
          <span>{filteredDoctors.length} profile{filteredDoctors.length === 1 ? '' : 's'}</span>
        </div>
        {filteredDoctors.length ? <div className="connect-grid">
          {filteredDoctors.map(doctor => (
            <article className="connect-doctor" key={doctor.id}>
              <div className="connect-avatar" aria-hidden="true">{doctor.name.split(' ').map(part => part[0]).join('')}</div>
              <p className="connect-profile-tag">DEMO PROFILE</p>
              <h3>{doctor.name}</h3>
              <p className="connect-specialty">{doctor.specialty}</p>
              <p className="connect-focus">{doctor.focus}</p>
              <button className="connect-button connect-secondary" onClick={() => openProfile(doctor)}>View Profile</button>
            </article>
          ))}
        </div> : <p className="connect-empty">No profiles match those filters. Try another search.</p>}
      </section>

      <section className="connect-sharing">
        <div>
          <p className="connect-eyebrow">REPORT SHARING DEMO</p>
          <h2>Review before you choose</h2>
          <p>Sharing is <strong>{demoConsent ? 'enabled for this demo only' : 'off'}</strong>. No personal report or health data is read or sent.</p>
        </div>
        <div className="connect-sharing-actions">
          <button className="connect-button" onClick={() => setDialog('consent')}>Review sample report</button>
          {demoConsent && <button className="connect-text-button" onClick={() => setDemoConsent(false)}>Withdraw demo consent</button>}
        </div>
      </section>

      {dialog && <div className="connect-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeDialog(); }}>
        <section className="connect-dialog" role="dialog" aria-modal="true" aria-labelledby="connect-dialog-title">
          <button className="connect-close" aria-label="Close dialog" onClick={closeDialog}>×</button>
          {dialog === 'profile' && selectedDoctor && <>
            <p className="connect-eyebrow">FICTIONAL DEMONSTRATION PROFILE</p>
            <h2 id="connect-dialog-title">{selectedDoctor.name}</h2>
            <p className="connect-specialty">{selectedDoctor.specialty}</p>
            <p>{selectedDoctor.about}</p>
            <p className="connect-note">This profile is fictional. No real clinician, credentials, affiliation, or appointment availability is represented.</p>
            <button className="connect-button" onClick={openRequest}>Request Consultation</button>
          </>}

          {dialog === 'request' && selectedDoctor && <>
            <p className="connect-eyebrow">DEMONSTRATION ONLY</p>
            <h2 id="connect-dialog-title">Request Consultation</h2>
            <p>For <strong>{selectedDoctor.name}</strong> · {selectedDoctor.specialty}</p>
            {requestStatus ? <div className="connect-result" role="status"><p>{requestStatus}</p><button className="connect-button" onClick={closeDialog}>Done</button></div> : <form className="connect-form" onSubmit={submitRequest}>
              <label className="connect-control"><span>Consultation mode</span>
                <select value={consultation.mode} onChange={event => setConsultation({ ...consultation, mode: event.target.value })} required>
                  <option value="">Choose a mode</option>
                  <option value="Online conversation">Online conversation (demo)</option>
                  <option value="In-person conversation">In-person conversation (demo)</option>
                </select>
              </label>
              <label className="connect-control"><span>Message (optional)</span>
                <textarea rows="4" maxLength="500" value={consultation.message} onChange={event => setConsultation({ ...consultation, message: event.target.value })} placeholder="Do not include private health details in this demo." />
              </label>
              {formError && <p className="connect-error" role="alert">{formError}</p>}
              <p className="connect-note">Submitting only shows a local confirmation. Nothing is sent, saved, or booked.</p>
              <button className="connect-button" type="submit">Submit demo request</button>
            </form>}
          </>}

          {dialog === 'consent' && <>
            <p className="connect-eyebrow">CONSENT · SHARING IS OFF</p>
            <h2 id="connect-dialog-title">Review the sample report</h2>
            <p>A real health summary could include symptom patterns, cycle dates, and questions to discuss with a clinician. People may choose to share this context to help guide a conversation.</p>
            <div className="connect-report-preview">
              <strong>Sample only, not your data</strong>
              <p>Example summary: “A symptom was logged on a sample date. The person would like to ask about recurring discomfort.”</p>
              <p>No name, private report, account data, or actual symptoms are included.</p>
            </div>
            <p className="connect-note">Choosing Allow records demo consent only in this page's temporary state. Nothing is transmitted, no real report is generated or shared, and reloading resets the choice. You can withdraw it at any time.</p>
            <div className="connect-dialog-actions">
              <button className="connect-button" onClick={() => { setDemoConsent(true); closeDialog(); }}>Allow sharing for this demo</button>
              <button className="connect-text-button" onClick={() => { setDemoConsent(false); closeDialog(); }}>Continue without sharing</button>
            </div>
          </>}
        </section>
      </div>}
    </div>
  );
}