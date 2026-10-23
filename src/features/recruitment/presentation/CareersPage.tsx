import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Candidate, Job } from '../domain/models'
import { extractResumeDetails } from '../application/extractResumeDetails'
import {
  readRecruitmentState,
  saveRecruitmentState,
  saveResumeFile,
} from '../infrastructure/localRecruitmentStore'
import './recruitment.css'

function CareersPage() {
  const [initialLoad] = useState(readRecruitmentState)
  const [data, setData] = useState(initialLoad.state)
  const dataRef = useRef(initialLoad.state)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [success, setSuccess] = useState('')
  const [pageError, setPageError] = useState(initialLoad.error)

  const updateData = (update: (current: typeof initialLoad.state) => typeof initialLoad.state) => {
    const next = update(dataRef.current)
    dataRef.current = next
    setData(next)
    try {
      saveRecruitmentState(next)
      setPageError(null)
    } catch (error) {
      console.error('Unable to save TalentOra data in this browser.', error)
      setPageError('Your application could not be saved in this browser.')
    }
  }

  const openJobs = data.jobs.filter((job) => job.status === 'Open')

  return (
    <div className="careers-page">
      <header className="careers-header">
        <a className="brand" href="/" aria-label="TalentOra home">
          <span className="brand-mark"><span /></span>
          <span>talent<span>ora</span></span>
        </a>
        <a className="button button-secondary careers-signin" href="/">Recruiter sign in</a>
      </header>

      {pageError && <div className="careers-storage-notice" role="status">{pageError}</div>}
      {success ? (
        <main className="application-success">
          <span className="success-mark">✓</span>
          <span className="eyebrow">APPLICATION RECEIVED</span>
          <h1>Thanks for saying hello.</h1>
          <p>{success} Your application has been added to this local demo. The recruiting team can review it in the candidate dashboard.</p>
          <button className="button button-primary" onClick={() => setSuccess('')}>Explore other roles</button>
        </main>
      ) : (
        <>
          <section className="careers-hero">
            <span className="eyebrow">CAREERS AT NORTHSTAR</span>
            <h1>Do work that<br />moves us forward.</h1>
            <p>We’re a small, curious team building thoughtful tools for people doing meaningful work. Come build with us.</p>
            <a href="#open-roles" className="button button-primary">Explore open roles <span aria-hidden="true">↓</span></a>
            <div className="careers-hero-art" aria-hidden="true">
              <span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" />
              <span className="art-star">✳</span><span className="art-caption">Good work,<br />good people.</span>
            </div>
          </section>
          <main className="careers-main" id="open-roles">
            <div className="careers-section-heading"><div><span className="eyebrow">FIND YOUR PLACE</span><h2>Open roles</h2></div><span>{openJobs.length} positions</span></div>
            {openJobs.length === 0 ? (
              <div className="careers-empty"><h3>No open roles right now</h3><p>Check back soon. We’re always looking for good people.</p></div>
            ) : (
              <div className="public-job-list">
                {openJobs.map((job) => (
                  <article className="public-job-row" key={job.id}>
                    <div className="public-job-symbol">{job.department.slice(0, 1)}</div>
                    <div className="public-job-details"><h3>{job.title}</h3><p>{job.department} <span>·</span> {job.location} <span>·</span> {job.type}</p></div>
                    <button className="button button-secondary" onClick={() => setSelectedJob(job)}>Apply <span aria-hidden="true">↗</span></button>
                  </article>
                ))}
              </div>
            )}
            <section className="careers-note"><span>✳</span><div><strong>People over algorithms.</strong><p>Our team reviews every application. We don’t use automated candidate rankings to make hiring decisions.</p></div></section>
          </main>
          <footer className="careers-footer"><span>© {new Date().getFullYear()} Northstar Studio</span><span>Thoughtful work starts with thoughtful people.</span></footer>
        </>
      )}

      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSubmit={async (candidate, file) => {
            try {
              if (file) await saveResumeFile(candidate.id, file)
              updateData((current) => ({
                ...current,
                candidates: [candidate, ...current.candidates],
                activities: [
                  {
                    id: crypto.randomUUID(),
                    message: `New application from ${candidate.name}`,
                    date: new Date().toISOString(),
                  },
                  ...current.activities,
                ],
              }))
              setSelectedJob(null)
              setSuccess(`Your application for ${selectedJob.title} is in.`)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            } catch (error) {
              console.error('Unable to save the application locally.', error)
              throw error
            }
          }}
        />
      )}
    </div>
  )
}

function ApplicationModal({
  job,
  onClose,
  onSubmit,
}: {
  job: Job
  onClose: () => void
  onSubmit: (candidate: Candidate, file: File | null) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      jobId: job.id,
      stage: 'Applied',
      experience: experience.trim() || 'Not specified',
      skills: skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      resumeName: file?.name ?? '',
      resumeText: resumeText.trim(),
      addedAt: new Date().toISOString(),
    }
    try {
      await onSubmit(candidate, file)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Your application could not be saved.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card application-modal" role="dialog" aria-modal="true" aria-labelledby="apply-title">
        <div className="modal-heading"><div><span className="eyebrow">APPLYING FOR</span><h2 id="apply-title">{job.title}</h2><p>{job.department} · {job.location}</p></div><button className="icon-button" aria-label="Close application" onClick={onClose}><span aria-hidden="true">×</span></button></div>
        <form className="form-stack" onSubmit={(event) => void submit(event)}>
          <div className="form-grid"><label className="field-label">Full name<input className="form-control" required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label className="field-label">Email<input className="form-control" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label></div>
          <div className="form-grid"><label className="field-label">Phone <span className="optional-label">Optional</span><input className="form-control" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" /></label><label className="field-label">Location<input className="form-control" value={location} onChange={(event) => setLocation(event.target.value)} autoComplete="address-level2" placeholder="City or remote" /></label></div>
          <div className="form-grid"><label className="field-label">Experience<input className="form-control" value={experience} onChange={(event) => setExperience(event.target.value)} placeholder="e.g. 5 years" /></label><label className="field-label">Skills <span className="optional-label">Optional</span><input className="form-control" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Comma-separated" /></label></div>
          <label className="field-label">Resume file <span className="optional-label">PDF, DOC, DOCX or TXT · saved on this device</span><input className="file-input" type="file" accept=".pdf,.txt,.doc,.docx" onChange={(event) => {
            const selected = event.target.files?.[0] ?? null
            setFile(selected)
            if (selected && (selected.type === 'text/plain' || selected.name.toLowerCase().endsWith('.txt'))) {
              void selected.text().then((text) => {
                setResumeText(text)
                const extracted = extractResumeDetails(text)
                if (!name && extracted.name) setName(extracted.name)
                if (!email && extracted.email) setEmail(extracted.email)
                if (!phone && extracted.phone) setPhone(extracted.phone)
                if (!experience && extracted.experience) setExperience(extracted.experience)
                if (extracted.skills.length) setSkills(extracted.skills.join(', '))
              }).catch((readError: unknown) => {
                console.error('Unable to read the selected text resume.', readError)
                setError('The text resume could not be read. You can still paste resume text below.')
              })
            }
          }} />{file && <span className="file-feedback">{file.name} · will be stored in your browser</span>}</label>
          <label className="field-label">Resume text <span className="optional-label">Text files can be extracted automatically</span><textarea className="form-control form-textarea" rows={3} value={resumeText} onChange={(event) => setResumeText(event.target.value)} placeholder="Paste your resume text for a structured preview in the recruiter dashboard." /></label>
          <p className="privacy-note">This demonstration stores your application in this browser only. Your information isn't sent to a company server.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Submitting…' : 'Submit application'} <span aria-hidden="true">↗</span></button></div>
        </form>
      </section>
    </div>
  )
}

export default CareersPage
