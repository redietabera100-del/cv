import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const competencies = [
  'Attention to detail and sound judgment',
  'Policy and guideline adherence',
  'Confidentiality and sensitive information handling',
  'Empathy and active listening',
  'Critical thinking',
  'Customer service and communication',
  'Social media familiarity',
  'Data collection and accurate record keeping',
  'Teamwork and adaptability',
  'Basic computer skills',
];

const initialResume = {
  id: 'resume-1',
  label: 'Resume 1',
  role: 'Public Health Officer',
  location: 'Addis Ababa, Ethiopia',
  summary: 'Detail-oriented Public Health Officer graduate with experience in counseling, data collection, and handling sensitive information. Native Amharic speaker with fluent English communication skills. Brings sound judgment, empathy, attention to detail, and the ability to follow established procedures when working with sensitive material. Seeking to apply these transferable skills in a Content Moderator role.',
  experience: [
    {
      role: 'Call Center Agent (Counselor and Data Collector)',
      meta: 'ICAF Project | March 2026 – Present',
      details: [
        'Provided counseling and support to callers using a softphone.',
        'Collected and recorded caller data accurately using ODK (Open Data Kit).',
        'Managed assigned calls and follow-ups through a call dashboard.',
        'Prepared reports on counseling and data collection activities.',
        'Maintained strict confidentiality while handling sensitive patient information.',
      ],
    },
    { role: 'Waiting Room Assistant', meta: '5 months', details: [] },
  ],
};

const DB_NAME = 'rediet-abera-resumes';
const DB_VERSION = 1;
const STATE_KEY = 'resume-workspace';

function openResumeDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('workspace')) {
        request.result.createObjectStore('workspace', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readWorkspace(database) {
  return new Promise((resolve, reject) => {
    const request = database.transaction('workspace', 'readonly').objectStore('workspace').get(STATE_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

function writeWorkspace(database, resumes, activeId) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('workspace', 'readwrite');
    transaction.objectStore('workspace').put({ id: STATE_KEY, resumes, activeId });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function Section({ title, children }) {
  return <section><h2>{title}</h2>{children}</section>;
}

function CV({ resume }) {
  return (
    <main className="page" aria-label={`Curriculum vitae: ${resume.label}`}>
      <header className="cv-header">
        <h1>REDIET ABERA</h1>
        <div className="headline">{resume.role}</div>
        <div className="contact">
          <a href="mailto:aberarediet716@gmail.com">aberarediet716@gmail.com</a>
          <a href="tel:0943337272">0943337272</a>
          <span>{resume.location}</span>
        </div>
      </header>

      <Section title="Professional Summary"><p className="summary">{resume.summary}</p></Section>
      <Section title="Core Competencies">
        <ul className="skills">{competencies.map((item) => <li key={item}>{item}</li>)}</ul>
      </Section>
      <Section title="Professional Experience">
        {resume.experience.map((job, index) => (
          <article className="job" key={`${resume.id}-job-${index}`}>
            <h3 className="role">{job.role}</h3>
            {job.meta && <p className="meta">{job.meta}</p>}
            {job.details.length > 0 && <ul className="details">{job.details.map((item, detailIndex) => <li key={`${index}-${detailIndex}`}>{item}</li>)}</ul>}
          </article>
        ))}
      </Section>
      <Section title="Education">
        <div className="education-item">
          <h3 className="role">Public Health Officer</h3>
          <p className="education-line">University of Gondar | 2024 | GPA: 3.58</p>
        </div>
      </Section>
      <Section title="Certifications & Training">
        <ul className="details certifications">
          <li><a href="https://adha.edu.et/en/credential/ADHA-C-2026-SDFN7T" target="_blank" rel="noreferrer">Digital Health Foundations | Africa Digital Health Academy | 25 November 2026</a> (ADHA-C-2026-SDFN7T · 5 CPD points · valid through 25 November 2029)</li>
          <li>Employability Skills and Job Readiness | October 2023</li>
          <li>English Language Proficiency | University of Gondar, 2024</li>
          <li>Africa Girls Can Code Initiative | 29 July – 16 August 2019</li>
          <li>Intermediate English Diploma | 13 November 2006 E.C.</li>
        </ul>
      </Section>
      <Section title="Languages">
        <div className="languages">
          <div><strong>Amharic:</strong> Native</div>
          <div><strong>English:</strong> Fluent</div>
        </div>
      </Section>
      <footer>References available upon request</footer>
    </main>
  );
}

function ResumeEditor({ resume, onChange }) {
  const setField = (field, value) => onChange({ ...resume, [field]: value });
  const updateJob = (index, field, value) => {
    const experience = resume.experience.map((job, jobIndex) => jobIndex === index ? { ...job, [field]: value } : job);
    setField('experience', experience);
  };

  return (
    <details className="editor">
      <summary aria-label="Edit this resume">
        <svg className="edit-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
        <svg className="close-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
        <span className="visually-hidden"><span className="closed-label">Edit this resume</span><span className="open-label">Close resume editor</span></span>
      </summary>
      <div className="editor-fields">
        <label>Role or target title
          <input value={resume.role} onChange={(event) => setField('role', event.target.value)} />
        </label>
        <label>Location
          <input value={resume.location} onChange={(event) => setField('location', event.target.value)} />
        </label>
        <label className="full-width">Professional summary
          <textarea rows="4" value={resume.summary} onChange={(event) => setField('summary', event.target.value)} />
        </label>
        <div className="experience-edit full-width">
          <h3>Professional experience</h3>
          {resume.experience.map((job, index) => (
            <fieldset className="job-editor" key={`${resume.id}-edit-${index}`}>
              <legend>Experience {index + 1}</legend>
              <label>Job title
                <input value={job.role} onChange={(event) => updateJob(index, 'role', event.target.value)} />
              </label>
              <label>Organization and dates
                <input value={job.meta} onChange={(event) => updateJob(index, 'meta', event.target.value)} />
              </label>
              <label className="full-width">Responsibilities (one per line)
                <textarea rows="4" value={job.details.join('\n')} onChange={(event) => updateJob(index, 'details', event.target.value.split('\n'))} />
              </label>
              <button className="remove-job" type="button" onClick={() => setField('experience', resume.experience.filter((_, jobIndex) => jobIndex !== index))}>Remove this experience</button>
            </fieldset>
          ))}
          <button className="secondary-button" type="button" onClick={() => setField('experience', [...resume.experience, { role: 'Job title', meta: 'Organization | Dates', details: ['Responsibility or achievement'] }])}>Add experience</button>
        </div>
      </div>
    </details>
  );
}

function App() {
  const [resumes, setResumes] = useState([initialResume]);
  const [activeId, setActiveId] = useState(initialResume.id);
  const [isReady, setIsReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Loading saved resumes…');
  const databaseRef = useRef(null);
  const tabRefs = useRef([]);
  const activeResume = resumes.find((resume) => resume.id === activeId) ?? resumes[0];

  useEffect(() => {
    let cancelled = false;
    openResumeDatabase().then(async (database) => {
      databaseRef.current = database;
      const saved = await readWorkspace(database);
      if (cancelled) return;
      if (saved?.resumes?.length) {
        setResumes(saved.resumes);
        setActiveId(saved.resumes.some((resume) => resume.id === saved.activeId) ? saved.activeId : saved.resumes[0].id);
      }
      setSaveStatus('Saved in this browser');
      setIsReady(true);
    }).catch(() => {
      if (cancelled) return;
      setSaveStatus('Browser storage is unavailable; changes may not persist.');
      setIsReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isReady || !databaseRef.current) return undefined;
    setSaveStatus('Saving…');
    const timer = window.setTimeout(() => {
      writeWorkspace(databaseRef.current, resumes, activeId)
        .then(() => setSaveStatus('Saved in this browser'))
        .catch(() => setSaveStatus('Could not save changes in this browser.'));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [resumes, activeId, isReady]);

  const updateActiveResume = (updated) => setResumes((current) => current.map((resume) => resume.id === updated.id ? updated : resume));

  const addResume = () => {
    const newResume = structuredClone(activeResume);
    newResume.id = `resume-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    newResume.label = `Resume ${resumes.length + 1}`;
    setResumes((current) => [...current, newResume]);
    setActiveId(newResume.id);
    window.setTimeout(() => tabRefs.current[resumes.length]?.focus(), 0);
  };

  const selectRelativeTab = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? resumes.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + resumes.length) % resumes.length;
    setActiveId(resumes[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  if (!activeResume) return null;

  return (
    <>
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <h2 className="workspace-title">Resume versions</h2>
            <p className="save-status" role="status">{saveStatus}</p>
          </div>
          <button className="download-button" type="button" onClick={() => window.print()} disabled={!isReady}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v4h14v-4" /></svg>
            Download selected PDF
          </button>
        </div>
        <div className="tab-row">
          <div className="resume-tabs" role="tablist" aria-label="Resume versions">
            {resumes.map((resume, index) => (
              <button
                className="resume-tab"
                key={resume.id}
                id={`tab-${resume.id}`}
                type="button"
                role="tab"
                aria-selected={resume.id === activeId}
                aria-controls={`panel-${resume.id}`}
                tabIndex={resume.id === activeId ? 0 : -1}
                ref={(element) => { tabRefs.current[index] = element; }}
                onClick={() => setActiveId(resume.id)}
                onKeyDown={(event) => selectRelativeTab(event, index)}
              >{resume.label}</button>
            ))}
          </div>
          <button className="secondary-button add-tab" type="button" onClick={addResume} disabled={!isReady}>+ Add tab</button>
        </div>
        <div className="workspace-content" id={`panel-${activeResume.id}`} role="tabpanel" aria-labelledby={`tab-${activeResume.id}`}>
          <fieldset className="editor-fieldset" disabled={!isReady}>
            <ResumeEditor resume={activeResume} onChange={updateActiveResume} />
          </fieldset>
        </div>
      </div>
      <CV resume={activeResume} />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
