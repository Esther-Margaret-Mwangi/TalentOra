import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  candidateStages,
  type Candidate,
  type CandidateStage,
  type Interview,
  type Job,
  type RecruitmentState,
} from '../domain/models'
import {
  createInterviewQuestions,
  getJobApplicantCount,
  getResumeSummary,
  getStageCounts,
} from '../application/recruitmentInsights'
import { extractResumeDetails } from '../application/extractResumeDetails'
import { getResumeDocument } from '../application/resumeDocuments'
import {
  readRecruitmentState,
  saveRecruitmentState,
  saveResumeFile,
} from '../infrastructure/localRecruitmentStore'
import './recruitment.css'

type View = 'Overview' | 'Vacancies' | 'Candidates' | 'Interviews' | 'AI assistant' | 'Analytics'
type IconName =
  | 'overview'
  | 'jobs'
  | 'candidates'
  | 'interviews'
  | 'assistant'
  | 'analytics'
  | 'settings'
  | 'search'
  | 'plus'
  | 'arrow'
  | 'chevron'
  | 'close'
  | 'clock'
  | 'location'
  | 'file'
  | 'sparkle'
  | 'filter'
  | 'calendar'
  | 'trend'
  | 'mail'
  | 'check'
  | 'external'
  | 'briefcase'
  | 'users'
  | 'menu'
  | 'dots'

const iconPaths: Record<IconName, ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  jobs: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
  candidates: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  interviews: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h3M8 17h6" /></>,
  assistant: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14ZM5 2l.8 2.2L8 5l-2.2.8L5 8l-.8-2.2L2 5l2.2-.8L5 2Z" /></>,
  analytics: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5M15 9h4v4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
  sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" /></>,
  filter: <><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /></>,
  calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  external: <><path d="M14 3h7v7M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 8v6m3-3h-6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  )
}

const navigation: { label: View; icon: IconName }[] = [
  { label: 'Overview', icon: 'overview' },
  { label: 'Vacancies', icon: 'jobs' },
  { label: 'Candidates', icon: 'candidates' },
  { label: 'Interviews', icon: 'interviews' },
  { label: 'AI assistant', icon: 'assistant' },
  { label: 'Analytics', icon: 'analytics' },
]

const stageColors: Record<CandidateStage, string> = {
  Applied: 'stage-applied',
  Screening: 'stage-screening',
  Interview: 'stage-interview',
  Offer: 'stage-offer',
  Hired: 'stage-hired',
}

const formattedDate = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', options ?? { month: 'short', day: 'numeric' }).format(
    new Date(`${date.slice(0, 10)}T12:00:00`),
  )

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return <span className={`avatar${small ? ' avatar-small' : ''}`}>{initials(name)}</span>
}

function RecruitmentDashboard() {
  const [initialLoad] = useState(readRecruitmentState)
  const [data, setData] = useState(initialLoad.state)
  const dataRef = useRef(initialLoad.state)
  const [storageError, setStorageError] = useState(initialLoad.error)
  const [view, setView] = useState<View>('Overview')
  const [modal, setModal] = useState<'job' | 'candidate' | 'interview' | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [toast, setToast] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const updateData = (update: (current: RecruitmentState) => RecruitmentState) => {
    const next = update(dataRef.current)
    dataRef.current = next
    setData(next)
    try {
      saveRecruitmentState(next)
      setStorageError(null)
    } catch (error) {
      console.error('Unable to save TalentOra data in this browser.', error)
      setStorageError('Your latest changes could not be saved in this browser.')
    }
  }

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const addActivity = (message: string) => ({
    id: crypto.randomUUID(),
    message,
    date: new Date().toISOString(),
  })

  const changeStage = (candidateId: string, stage: CandidateStage) => {
    const candidate = data.candidates.find((person) => person.id === candidateId)
    if (!candidate || candidate.stage === stage) return
    updateData((current) => ({
      ...current,
      candidates: current.candidates.map((person) =>
        person.id === candidateId ? { ...person, stage } : person,
      ),
      activities: [
        addActivity(`${candidate.name} moved to ${stage}`),
        ...current.activities,
      ],
    }))
    setToast(`${candidate.name} moved to ${stage}`)
  }

  const openJobs = () => {
    setView('Vacancies')
    setModal('job')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>
        <a className="brand" href="/" aria-label="TalentOra home">
          <span className="brand-mark"><span /></span>
          <span>talent<span>ora</span></span>
        </a>

        <div className="workspace-switcher">
          <div className="workspace-avatar">N</div>
          <div className="workspace-copy">
            <strong>Northstar Studio</strong>
            <span>Recruiting team</span>
          </div>
          <button className="icon-button workspace-menu" aria-label="Workspace options">
            <Icon name="dots" size={16} />
          </button>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          <span className="nav-caption">WORKSPACE</span>
          {navigation.map((item) => (
            <button
              className={`nav-item${view === item.label ? ' nav-item-active' : ''}`}
              key={item.label}
              onClick={() => {
                setView(item.label)
                setMenuOpen(false)
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.label === 'Interviews' && data.interviews.length > 0 && (
                <span className="nav-count">{data.interviews.length}</span>
              )}
            </button>
          ))}
          <span className="nav-caption nav-caption-spaced">COMPANY</span>
          <a className="nav-item nav-link" href="/careers">
            <Icon name="external" />
            <span>Careers page</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Icon name="settings" />
            <span>Settings</span>
          </button>
          <div className="profile-card">
            <div className="profile-avatar">JD</div>
            <div className="profile-copy">
              <strong>Jordan Davis</strong>
              <span>Recruiting lead</span>
            </div>
            <button className="icon-button" aria-label="Profile options">
              <Icon name="dots" size={16} />
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{view}</strong></div>
          <div className="topbar-actions">
            <span className="local-badge"><span /> Local demo</span>
            <button className="icon-button topbar-search" aria-label="Search candidates" onClick={() => setView('Candidates')}>
              <Icon name="search" />
            </button>
            <button className="topbar-avatar" aria-label="Account menu">JD</button>
          </div>
        </header>

        {storageError && (
          <div className="storage-notice" role="status">
            <Icon name="file" size={16} />
            <span>{storageError}</span>
            <button className="icon-button" aria-label="Dismiss message" onClick={() => setStorageError(null)}>
              <Icon name="close" size={15} />
            </button>
          </div>
        )}

        <div className="page-content">
          {view === 'Overview' && (
            <OverviewView
              data={data}
              onViewChange={setView}
              onCreateJob={openJobs}
              onCandidateSelect={setSelectedCandidate}
            />
          )}
          {view === 'Vacancies' && (
            <VacanciesView
              data={data}
              onCreate={() => setModal('job')}
              onCandidateSelect={setSelectedCandidate}
            />
          )}
          {view === 'Candidates' && (
            <CandidatesView
              data={data}
              onAdd={() => setModal('candidate')}
              onStageChange={changeStage}
              onSelect={setSelectedCandidate}
            />
          )}
          {view === 'Interviews' && (
            <InterviewsView
              data={data}
              onSchedule={() => setModal('interview')}
              onCandidateSelect={setSelectedCandidate}
            />
          )}
          {view === 'AI assistant' && <AssistantView data={data} />}
          {view === 'Analytics' && <AnalyticsView data={data} />}
        </div>
      </main>

      {modal === 'job' && (
        <JobModal
          onClose={() => setModal(null)}
          onSave={(job) => {
            updateData((current) => ({
              ...current,
              jobs: [job, ...current.jobs],
              activities: [addActivity(`New vacancy created: ${job.title}`), ...current.activities],
            }))
            setModal(null)
            setToast(`${job.title} created`)
          }}
        />
      )}
      {modal === 'candidate' && (
        <CandidateModal
          jobs={data.jobs.filter((job) => job.status === 'Open')}
          onClose={() => setModal(null)}
          onSave={(candidate, file) => {
            const saveCandidate = async () => {
              if (file) await saveResumeFile(candidate.id, file)
              updateData((current) => ({
                ...current,
                candidates: [candidate, ...current.candidates],
                activities: [
                  addActivity(`New application from ${candidate.name}`),
                  ...current.activities,
                ],
              }))
              setModal(null)
              setToast(`Candidate added for ${data.jobs.find((job) => job.id === candidate.jobId)?.title ?? 'the role'}`)
            }
            void saveCandidate().catch((error: unknown) => {
              console.error('Unable to save candidate or resume.', error)
              setToast(error instanceof Error ? error.message : 'The candidate could not be saved.')
            })
          }}
        />
      )}
      {modal === 'interview' && (
        <InterviewModal
          candidates={data.candidates}
          jobs={data.jobs}
          onClose={() => setModal(null)}
          onSave={(interview) => {
            const candidate = data.candidates.find((person) => person.id === interview.candidateId)
            updateData((current) => ({
              ...current,
              interviews: [interview, ...current.interviews],
              activities: [
                addActivity(`Interview scheduled with ${candidate?.name ?? 'candidate'}`),
                ...current.activities,
              ],
            }))
            setModal(null)
            setToast('Interview scheduled')
          }}
        />
      )}
      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          job={data.jobs.find((job) => job.id === selectedCandidate.jobId)}
          onClose={() => setSelectedCandidate(null)}
          onStageChange={(stage) => {
            changeStage(selectedCandidate.id, stage)
            setSelectedCandidate((current) => current ? { ...current, stage } : null)
          }}
        />
      )}
      {toast && <div className="toast" role="status"><Icon name="check" size={17} />{toast}</div>}
    </div>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: ReactNode
  description: string
  action?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  )
}

function MetricCard({
  label,
  value,
  note,
  icon,
  tone = 'blue',
}: {
  label: string
  value: string | number
  note: string
  icon: IconName
  tone?: string
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-${tone}`}><Icon name={icon} size={18} /></div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
    </article>
  )
}

function OverviewView({
  data,
  onViewChange,
  onCreateJob,
  onCandidateSelect,
}: {
  data: RecruitmentState
  onViewChange: (view: View) => void
  onCreateJob: () => void
  onCandidateSelect: (candidate: Candidate) => void
}) {
  const openJobs = data.jobs.filter((job) => job.status === 'Open')
  const activeCandidates = data.candidates.filter((candidate) => candidate.stage !== 'Hired')
  const upcoming = [...data.interviews]
    .filter((interview) => interview.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 3)
  const stageCounts = getStageCounts(data.candidates)

  return (
    <>
      <PageHeading
        eyebrow={new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }).format(new Date()).toUpperCase()}
        title={<>Good morning, Jordan <span className="wave">✳</span></>}
        description="Here's what's happening across your hiring today."
        action={
          <button className="button button-primary" onClick={onCreateJob}>
            <Icon name="plus" size={17} /> Create a vacancy
          </button>
        }
      />

      <section className="metric-grid" aria-label="Recruitment overview">
        <MetricCard label="Open vacancies" value={openJobs.length} note="+2 this month" icon="briefcase" />
        <MetricCard label="Candidates in pipeline" value={activeCandidates.length} note="Across all open roles" icon="users" tone="mint" />
        <MetricCard label="Interviews this week" value={upcoming.length} note="Next up tomorrow" icon="calendar" tone="peach" />
        <MetricCard label="Average time to hire" value="24 days" note="↓ 4 days this quarter" icon="trend" tone="violet" />
      </section>

      <section className="overview-grid">
        <div className="panel pipeline-panel">
          <div className="panel-heading">
            <div><h2>Hiring pipeline</h2><p>Candidate progress across every stage</p></div>
            <button className="text-button" onClick={() => onViewChange('Analytics')}>View analytics <Icon name="arrow" size={15} /></button>
          </div>
          <div className="pipeline-total"><strong>{data.candidates.length}</strong><span>candidates</span><span className="pipeline-period">All active roles</span></div>
          <div className="pipeline-bars" role="img" aria-label="Candidate counts at each hiring stage">
            {stageCounts.map(({ stage, count }, index) => (
              <div className="pipeline-step" key={stage}>
                <div className="pipeline-bar-track">
                  <div className={`pipeline-bar pipeline-color-${index}`} style={{ height: `${Math.max(14, (count / Math.max(data.candidates.length, 1)) * 100)}%` }} />
                </div>
                <strong>{count}</strong>
                <span>{stage}</span>
              </div>
            ))}
          </div>
          <div className="panel-footnote"><span className="legend-dot" /> Pipeline stages are updated by your team</div>
        </div>

        <div className="panel insight-panel">
          <div className="insight-kicker"><span className="insight-icon"><Icon name="sparkle" size={16} /></span> A thoughtful nudge</div>
          <h2>Keep the conversation moving</h2>
          <p>
            {upcoming.length
              ? `${upcoming.length} interviews are on the calendar. Add notes after each conversation to keep your team in sync.`
              : 'Your team has no upcoming interviews. Schedule a conversation when a candidate is ready.'}
          </p>
          <button className="button button-light" onClick={() => onViewChange('Interviews')}>
            See interview schedule <Icon name="arrow" size={15} />
          </button>
          <div className="human-note"><span>✳</span> Your team makes every hiring decision.</div>
        </div>
      </section>

      <section className="overview-grid overview-grid-lower">
        <div className="panel vacancies-panel">
          <div className="panel-heading">
            <div><h2>Current vacancies</h2><p>The roles your team is hiring for</p></div>
            <button className="text-button" onClick={() => onViewChange('Vacancies')}>All vacancies <Icon name="arrow" size={15} /></button>
          </div>
          {openJobs.length === 0 ? (
            <EmptyState title="No open vacancies yet" text="Create your first role to get started." />
          ) : (
            <div className="vacancy-list">
              {openJobs.slice(0, 4).map((job) => (
                <button className="vacancy-row" key={job.id} onClick={() => onViewChange('Vacancies')}>
                  <span className="vacancy-symbol">{job.department.slice(0, 1)}</span>
                  <span className="vacancy-name"><strong>{job.title}</strong><span>{job.department} · {job.location}</span></span>
                  <span className="vacancy-applicants">{getJobApplicantCount(data, job.id)} applicants</span>
                  <Icon name="chevron" size={15} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel interviews-panel">
          <div className="panel-heading">
            <div><h2>Coming up</h2><p>Your next candidate conversations</p></div>
            <button className="icon-button" aria-label="Open interviews" onClick={() => onViewChange('Interviews')}><Icon name="arrow" size={16} /></button>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState title="Nothing scheduled" text="Your upcoming interviews will appear here." />
          ) : (
            <div className="upcoming-list">
              {upcoming.map((interview) => {
                const candidate = data.candidates.find((person) => person.id === interview.candidateId)
                const job = data.jobs.find((role) => role.id === interview.jobId)
                return (
                  <button className="upcoming-row" key={interview.id} onClick={() => candidate && onCandidateSelect(candidate)}>
                    <span className="date-tile"><strong>{formattedDate(interview.date, { day: '2-digit' })}</strong><span>{formattedDate(interview.date, { month: 'short' })}</span></span>
                    <Avatar name={candidate?.name ?? 'Candidate'} small />
                    <span className="upcoming-person"><strong>{candidate?.name ?? 'Candidate'}</strong><span>{job?.title ?? interview.kind}</span></span>
                    <span className="upcoming-time">{interview.time}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="panel activity-panel">
        <div className="panel-heading">
          <div><h2>Recent activity</h2><p>A shared view of the latest team updates</p></div>
          <button className="text-button" onClick={() => onViewChange('Candidates')}>View candidates <Icon name="arrow" size={15} /></button>
        </div>
        {data.activities.slice(0, 3).map((activity) => (
          <div className="activity-row" key={activity.id}>
            <span className="activity-indicator"><Icon name="check" size={13} /></span>
            <span className="activity-message">{activity.message}</span>
            <span className="activity-date">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(activity.date))}</span>
          </div>
        ))}
      </section>
    </>
  )
}

function VacanciesView({
  data,
  onCreate,
  onCandidateSelect,
}: {
  data: RecruitmentState
  onCreate: () => void
  onCandidateSelect: (candidate: Candidate) => void
}) {
  const [filter, setFilter] = useState('All')
  const jobs = data.jobs.filter((job) => filter === 'All' || job.status === filter)

  return (
    <>
      <PageHeading
        eyebrow="HIRING"
        title="Your vacancies"
        description="Create roles, share them with candidates, and keep hiring moving."
        action={<button className="button button-primary" onClick={onCreate}><Icon name="plus" size={17} /> Create a vacancy</button>}
      />
      <div className="filter-row">
        <div className="filter-tabs" role="tablist" aria-label="Filter vacancies">
          {['All', 'Open', 'Draft', 'Closed'].map((status) => (
            <button className={filter === status ? 'filter-tab filter-tab-active' : 'filter-tab'} key={status} onClick={() => setFilter(status)}>{status}</button>
          ))}
        </div>
        <a className="button button-secondary careers-link" href="/careers"><Icon name="external" size={16} /> Preview careers page</a>
      </div>
      <div className="job-grid">
        {jobs.map((job) => {
          const applicants = data.candidates.filter((candidate) => candidate.jobId === job.id)
          return (
            <article className="job-card" key={job.id}>
              <div className="job-card-head"><span className="vacancy-symbol">{job.department.slice(0, 1)}</span><span className={`status-pill status-${job.status.toLowerCase()}`}>{job.status}</span></div>
              <h2>{job.title}</h2>
              <p className="job-department">{job.department} · {job.type}</p>
              <div className="job-location"><Icon name="location" size={15} />{job.location}</div>
              <div className="job-card-divider" />
              <div className="job-card-bottom">
                <span className="job-applicants"><strong>{applicants.length}</strong> applicants</span>
                <div className="avatar-stack">
                  {applicants.slice(0, 3).map((candidate) => (
                    <button key={candidate.id} aria-label={`View ${candidate.name}`} onClick={() => onCandidateSelect(candidate)}><Avatar name={candidate.name} small /></button>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {jobs.length === 0 && <EmptyState title="No vacancies in this view" text="Try another filter or create a new vacancy." />}
    </>
  )
}

function CandidatesView({
  data,
  onAdd,
  onStageChange,
  onSelect,
}: {
  data: RecruitmentState
  onAdd: () => void
  onStageChange: (candidateId: string, stage: CandidateStage) => void
  onSelect: (candidate: Candidate) => void
}) {
  const [query, setQuery] = useState('')
  const [jobFilter, setJobFilter] = useState('All roles')
  const filtered = data.candidates.filter((candidate) => {
    const job = data.jobs.find((role) => role.id === candidate.jobId)
    const matchesQuery = `${candidate.name} ${candidate.email} ${job?.title ?? ''}`
      .toLowerCase()
      .includes(query.toLowerCase())
    return matchesQuery && (jobFilter === 'All roles' || candidate.jobId === jobFilter)
  })

  return (
    <>
      <PageHeading
        eyebrow="PEOPLE"
        title="Candidates"
        description="Get to know every applicant and keep decisions in your team's hands."
        action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" size={17} /> Add candidate</button>}
      />
      <div className="panel candidate-panel">
        <div className="table-toolbar">
          <label className="search-field"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search candidates..." /></label>
          <label className="select-filter"><Icon name="filter" size={16} /><select value={jobFilter} onChange={(event) => setJobFilter(event.target.value)}><option>All roles</option>{data.jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label>
          <span className="results-count">{filtered.length} people</span>
        </div>
        <div className="table-scroll">
          <table className="candidate-table">
            <thead><tr><th>Candidate</th><th>Applied for</th><th>Experience</th><th>Stage</th><th>Added</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
            <tbody>
              {filtered.map((candidate) => {
                const job = data.jobs.find((role) => role.id === candidate.jobId)
                return (
                  <tr key={candidate.id}>
                    <td><button className="candidate-name-button" onClick={() => onSelect(candidate)}><Avatar name={candidate.name} /><span><strong>{candidate.name}</strong><small>{candidate.email}</small></span></button></td>
                    <td>{job?.title ?? 'Role removed'}</td>
                    <td>{candidate.experience}</td>
                    <td><label className={`stage-pill ${stageColors[candidate.stage]}`}><span /> <select aria-label={`${candidate.name} stage`} value={candidate.stage} onChange={(event) => onStageChange(candidate.id, event.target.value as CandidateStage)}>{candidateStages.map((stage) => <option key={stage}>{stage}</option>)}</select></label></td>
                    <td>{formattedDate(candidate.addedAt)}</td>
                    <td><button className="icon-button row-action" aria-label={`View ${candidate.name}`} onClick={() => onSelect(candidate)}><Icon name="chevron" size={16} /></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState title="No candidates found" text="Try a different name or role filter." />}
        </div>
        <div className="table-footer">Showing {filtered.length} of {data.candidates.length} candidates</div>
      </div>
    </>
  )
}

function InterviewsView({
  data,
  onSchedule,
  onCandidateSelect,
}: {
  data: RecruitmentState
  onSchedule: () => void
  onCandidateSelect: (candidate: Candidate) => void
}) {
  const sorted = [...data.interviews].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  return (
    <>
      <PageHeading
        eyebrow="SCHEDULE"
        title="Interviews"
        description="Plan candidate conversations and give every interviewer the context they need."
        action={<button className="button button-primary" onClick={onSchedule}><Icon name="plus" size={17} /> Schedule interview</button>}
      />
      <div className="panel interviews-page-panel">
        <div className="panel-heading"><div><h2>Interview schedule</h2><p>{data.interviews.length} conversations on the calendar</p></div><span className="local-badge"><span /> Your local calendar</span></div>
        {sorted.length === 0 ? <EmptyState title="No interviews scheduled" text="Schedule a conversation with a candidate to see it here." /> : (
          <div className="schedule-list">
            {sorted.map((interview) => {
              const candidate = data.candidates.find((person) => person.id === interview.candidateId)
              const job = data.jobs.find((role) => role.id === interview.jobId)
              return (
                <article className="schedule-row" key={interview.id}>
                  <div className="schedule-date"><strong>{formattedDate(interview.date, { day: '2-digit' })}</strong><span>{formattedDate(interview.date, { month: 'short', weekday: 'short' })}</span></div>
                  <div className="schedule-time"><Icon name="clock" size={16} />{interview.time}</div>
                  <button className="schedule-candidate" onClick={() => candidate && onCandidateSelect(candidate)}><Avatar name={candidate?.name ?? 'Candidate'} /><span><strong>{candidate?.name ?? 'Candidate'}</strong><small>{job?.title ?? interview.kind}</small></span></button>
                  <span className="interview-kind">{interview.kind}</span>
                  <span className="interview-format"><span /> Video call</span>
                </article>
              )
            })}
          </div>
        )}
      </div>
      <div className="callout-card"><span className="callout-icon"><Icon name="calendar" size={20} /></span><div><strong>A note about scheduling</strong><p>Interviews are saved in this browser. Calendar invitations and video links aren't sent in this local demo.</p></div></div>
    </>
  )
}

function AssistantView({ data }: { data: RecruitmentState }) {
  const [mode, setMode] = useState<'questions' | 'summary'>('questions')
  const [jobId, setJobId] = useState(data.jobs.find((job) => job.status === 'Open')?.id ?? '')
  const [candidateId, setCandidateId] = useState(data.candidates[0]?.id ?? '')
  const job = data.jobs.find((role) => role.id === jobId)
  const candidate = data.candidates.find((person) => person.id === candidateId)
  const [generated, setGenerated] = useState(false)

  return (
    <>
      <PageHeading eyebrow="HUMAN-LED AI" title="AI assistant" description="A little help with the busywork. Hiring decisions always stay with your team." />
      <div className="assistant-layout">
        <div className="panel assistant-main">
          <div className="assistant-tabs" role="tablist" aria-label="Assistant tools">
            <button className={mode === 'questions' ? 'assistant-tab assistant-tab-active' : 'assistant-tab'} onClick={() => { setMode('questions'); setGenerated(false) }}><Icon name="sparkle" size={16} /> Interview questions</button>
            <button className={mode === 'summary' ? 'assistant-tab assistant-tab-active' : 'assistant-tab'} onClick={() => { setMode('summary'); setGenerated(false) }}><Icon name="file" size={16} /> Resume summary</button>
          </div>
          {mode === 'questions' ? (
            <>
              <div className="assistant-intro"><span className="assistant-orb"><Icon name="sparkle" size={23} /></span><div><h2>Prepare a thoughtful interview</h2><p>Draft role-specific prompts from the requirements your team wrote.</p></div></div>
              <label className="field-label">Choose a vacancy<select className="form-control" value={jobId} onChange={(event) => { setJobId(event.target.value); setGenerated(false) }}>{data.jobs.filter((role) => role.status === 'Open').map((role) => <option key={role.id} value={role.id}>{role.title}</option>)}</select></label>
              <div className="assistant-source"><Icon name="file" size={16} /><span><strong>Question source</strong><small>Requirements saved on this vacancy</small></span><span className="source-count">{job?.requirements.split('\n').filter(Boolean).length ?? 0} items</span></div>
              <button className="button button-primary generate-button" disabled={!job} onClick={() => setGenerated(true)}><Icon name="sparkle" size={17} /> Draft interview questions</button>
              {generated && job && (
                <div className="generated-content"><div className="generated-heading"><div><span className="eyebrow">DRAFT PROMPTS</span><h3>{job.title}</h3></div><span className="draft-label">Review before use</span></div><ol className="question-list">{createInterviewQuestions(job).map((question, index) => <li key={`${question}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{question}</li>)}</ol><p className="source-citation"><Icon name="file" size={14} /> Generated from: vacancy requirements</p></div>
              )}
            </>
          ) : (
            <>
              <div className="assistant-intro"><span className="assistant-orb"><Icon name="file" size={22} /></span><div><h2>Understand the experience</h2><p>See a short, source-linked summary of candidate-provided resume text.</p></div></div>
              <label className="field-label">Choose a candidate<select className="form-control" value={candidateId} onChange={(event) => { setCandidateId(event.target.value); setGenerated(false) }}>{data.candidates.map((person) => <option key={person.id} value={person.id}>{person.name} · {data.jobs.find((role) => role.id === person.jobId)?.title ?? 'Candidate'}</option>)}</select></label>
              <button className="button button-primary generate-button" disabled={!candidate} onClick={() => setGenerated(true)}><Icon name="sparkle" size={17} /> Summarize resume</button>
              {generated && candidate && (
                <div className="generated-content"><div className="generated-heading"><div><span className="eyebrow">RESUME SUMMARY</span><h3>{candidate.name}</h3></div><span className="draft-label">For review</span></div><ul className="summary-list">{getResumeSummary(candidate).map((sentence, index) => <li key={`${sentence}-${index}`}><span>{sentence}</span><small><Icon name="file" size={13} /> {candidate.resumeName || 'Candidate-provided resume text'}</small></li>)}</ul><p className="source-citation"><Icon name="file" size={14} /> Source references point to candidate-provided resume text.</p></div>
              )}
            </>
          )}
        </div>
        <aside className="assistant-side">
          <div className="panel responsible-card"><span className="responsible-mark">✳</span><h2>People first, always</h2><p>Use these tools to support a conversation—not make a decision for you.</p><ul><li><Icon name="check" size={15} /> No candidate ranking</li><li><Icon name="check" size={15} /> No protected traits considered</li><li><Icon name="check" size={15} /> Every output is a draft</li></ul></div>
          <div className="assistant-demo-note"><Icon name="file" size={16} /><p>This local demo uses transparent, rule-based text generation. It doesn't send candidate data to an AI service.</p></div>
        </aside>
      </div>
    </>
  )
}

function AnalyticsView({ data }: { data: RecruitmentState }) {
  const stageCounts = getStageCounts(data.candidates)
  const totalApplicants = data.candidates.length
  const hires = data.candidates.filter((candidate) => candidate.stage === 'Hired').length
  const openRoleCount = data.jobs.filter((job) => job.status === 'Open').length

  return (
    <>
      <PageHeading eyebrow="INSIGHTS" title="Recruitment analytics" description="A clear, human-readable view of how hiring is moving." />
      <section className="metric-grid analytics-metrics">
        <MetricCard label="Candidates added" value={totalApplicants} note="Across all roles" icon="users" />
        <MetricCard label="Open roles" value={openRoleCount} note="Currently accepting applications" icon="briefcase" tone="mint" />
        <MetricCard label="Hired" value={hires} note="From this candidate list" icon="check" tone="peach" />
        <MetricCard label="Average time to hire" value="24 days" note="Illustrative demo metric" icon="trend" tone="violet" />
      </section>
      <div className="analytics-grid">
        <div className="panel analytics-pipeline">
          <div className="panel-heading"><div><h2>Pipeline by stage</h2><p>Current candidate count at each step</p></div><span className="analytics-period">Today</span></div>
          <div className="horizontal-bars">{stageCounts.map(({ stage, count }, index) => <div className="horizontal-bar-row" key={stage}><span>{stage}</span><div className="horizontal-bar-track"><span className={`horizontal-bar-fill pipeline-color-${index}`} style={{ width: `${Math.max(totalApplicants ? 3 : 0, (count / Math.max(totalApplicants, 1)) * 100)}%` }} /></div><strong>{count}</strong></div>)}</div>
          <p className="analytics-footnote"><Icon name="users" size={15} /> Counts reflect your current candidate records.</p>
        </div>
        <div className="panel analytics-roles">
          <div className="panel-heading"><div><h2>Applicants by vacancy</h2><p>Applications received per role</p></div></div>
          {data.jobs.filter((job) => job.status !== 'Closed').map((job) => {
            const count = getJobApplicantCount(data, job.id)
            const maxCount = Math.max(1, ...data.jobs.map((role) => getJobApplicantCount(data, role.id)))
            return <div className="role-bar-row" key={job.id}><div><span>{job.title}</span><strong>{count}</strong></div><span className="role-bar-track"><span style={{ width: `${(count / maxCount) * 100}%` }} /></span></div>
          })}
        </div>
      </div>
      <div className="callout-card analytics-callout"><span className="callout-icon"><Icon name="trend" size={19} /></span><div><strong>About these insights</strong><p>Analytics are calculated from locally stored demo records. Time-to-hire is illustrative and isn't calculated from real hiring outcomes.</p></div></div>
    </>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="file" size={20} /></span><strong>{title}</strong><span>{text}</span></div>
}

function ModalFrame({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><h2 id="modal-title">{title}</h2><p>{description}</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>
        {children}
      </section>
    </div>
  )
}

function JobModal({ onClose, onSave }: { onClose: () => void; onSave: (job: Job) => void }) {
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('Full-time')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({
      id: crypto.randomUUID(),
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      type,
      status: 'Open',
      description: description.trim(),
      requirements: requirements.trim(),
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <ModalFrame title="Create a vacancy" description="Add the details candidates will see on your careers page." onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <div className="form-grid"><label className="field-label">Job title<input className="form-control" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Product Designer" /></label><label className="field-label">Department<input className="form-control" required value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="e.g. Design" /></label></div>
        <div className="form-grid"><label className="field-label">Location<input className="form-control" required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Remote · US" /></label><label className="field-label">Employment type<select className="form-control" value={type} onChange={(event) => setType(event.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></label></div>
        <label className="field-label">Role description<textarea className="form-control form-textarea" required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell candidates what they'll work on..." /></label>
        <label className="field-label">Requirements<textarea className="form-control form-textarea" required rows={3} value={requirements} onChange={(event) => setRequirements(event.target.value)} placeholder="Add one requirement per line. The assistant can use these to draft interview questions." /></label>
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Icon name="plus" size={16} /> Publish vacancy</button></div>
      </form>
    </ModalFrame>
  )
}

function CandidateModal({
  jobs,
  onClose,
  onSave,
}: {
  jobs: Job[]
  onClose: () => void
  onSave: (candidate: Candidate, file: File | null) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [jobId, setJobId] = useState(jobs[0]?.id ?? '')
  const [experience, setExperience] = useState('')
  const [phone, setPhone] = useState('')
  const [skills, setSkills] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      jobId,
      stage: 'Applied',
      experience: experience.trim() || 'Not specified',
      skills: skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      resumeName: file?.name ?? '',
      resumeText: resumeText.trim(),
      addedAt: new Date().toISOString(),
    }, file)
  }

  return (
    <ModalFrame title="Add a candidate" description="Add an applicant to your local candidate pipeline." onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <div className="form-grid"><label className="field-label">Full name<input className="form-control" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Candidate name" /></label><label className="field-label">Email address<input className="form-control" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label></div>
        <div className="form-grid"><label className="field-label">Applied for<select className="form-control" required value={jobId} onChange={(event) => setJobId(event.target.value)}>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label><label className="field-label">Experience<input className="form-control" value={experience} onChange={(event) => setExperience(event.target.value)} placeholder="e.g. 5 years" /></label></div>
        <div className="form-grid"><label className="field-label">Location<input className="form-control" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or remote" /></label><label className="field-label">Phone <span className="optional-label">Optional</span><input className="form-control" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 555 010 0000" /></label></div>
        <label className="field-label">Resume file <span className="optional-label">Optional · saved only in this browser</span><input className="file-input" type="file" accept=".pdf,.txt,.doc,.docx" onChange={(event) => {
          const selected = event.target.files?.[0] ?? null
          setFileError('')
          setFile(selected)
          if (selected?.type === 'text/plain' || selected?.name.toLowerCase().endsWith('.txt')) {
            void selected.text().then((text) => {
              setResumeText(text)
              const extracted = extractResumeDetails(text)
              if (!name && extracted.name) setName(extracted.name)
              if (!email && extracted.email) setEmail(extracted.email)
              if (!phone && extracted.phone) setPhone(extracted.phone)
              if (!experience && extracted.experience) setExperience(extracted.experience)
              if (extracted.skills.length) setSkills(extracted.skills.join(', '))
            }).catch(() => setFileError('The text file could not be read. You can still paste resume text below.'))
          }
        }} />{fileError && <span className="field-error">{fileError}</span>}{file && <span className="file-feedback"><Icon name="check" size={14} /> {file.name} will be saved on this device</span>}</label>
        <label className="field-label">Skills <span className="optional-label">Comma-separated · extracted from .txt resumes when possible</span><input className="form-control" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="e.g. React, TypeScript, Accessibility" /></label>
        <label className="field-label">Resume text <span className="optional-label">Used for source-linked summaries</span><textarea className="form-control form-textarea" rows={4} value={resumeText} onChange={(event) => setResumeText(event.target.value)} placeholder="Paste candidate-provided resume text here. This demo summarizes the supplied text and references it as the source." /></label>
        <p className="privacy-note">Candidate data stays in this browser. No automated candidate ranking or selection is performed.</p>
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit" disabled={jobs.length === 0}><Icon name="plus" size={16} /> Add candidate</button></div>
      </form>
    </ModalFrame>
  )
}

function InterviewModal({
  candidates,
  jobs,
  onClose,
  onSave,
}: {
  candidates: Candidate[]
  jobs: Job[]
  onClose: () => void
  onSave: (interview: Interview) => void
}) {
  const [candidateId, setCandidateId] = useState(candidates[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [kind, setKind] = useState('Hiring manager conversation')
  const selectedCandidate = candidates.find((candidate) => candidate.id === candidateId)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedCandidate) return
    onSave({
      id: crypto.randomUUID(),
      candidateId,
      jobId: selectedCandidate.jobId,
      date,
      time,
      kind: kind.trim(),
    })
  }

  return (
    <ModalFrame title="Schedule an interview" description="Add a conversation to your local interview schedule." onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <label className="field-label">Candidate<select className="form-control" required value={candidateId} onChange={(event) => setCandidateId(event.target.value)}>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} · {jobs.find((job) => job.id === candidate.jobId)?.title ?? 'Candidate'}</option>)}</select></label>
        <div className="form-grid"><label className="field-label">Date<input className="form-control" type="date" required value={date} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setDate(event.target.value)} /></label><label className="field-label">Time<input className="form-control" type="time" required value={time} onChange={(event) => setTime(event.target.value)} /></label></div>
        <label className="field-label">Interview type<input className="form-control" required value={kind} onChange={(event) => setKind(event.target.value)} /></label>
        <p className="privacy-note">This adds the interview to TalentOra only. No calendar invitation is sent.</p>
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit" disabled={!candidates.length}><Icon name="calendar" size={16} /> Add to schedule</button></div>
      </form>
    </ModalFrame>
  )
}

function CandidateDetail({
  candidate,
  job,
  onClose,
  onStageChange,
}: {
  candidate: Candidate
  job: Job | undefined
  onClose: () => void
  onStageChange: (stage: CandidateStage) => void
}) {
  const summary = getResumeSummary(candidate)
  const [showResume, setShowResume] = useState(false)
  return (
    <div className="modal-backdrop detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="candidate-drawer" role="dialog" aria-modal="true" aria-labelledby="candidate-detail-title">
        <div className="drawer-top"><span className="eyebrow">CANDIDATE PROFILE</span><button className="icon-button" aria-label="Close candidate profile" onClick={onClose}><Icon name="close" /></button></div>
        <div className="drawer-person"><Avatar name={candidate.name} /><div><h2 id="candidate-detail-title">{candidate.name}</h2><p>{job?.title ?? 'Candidate'}</p></div></div>
        <div className="drawer-contact"><span><Icon name="mail" size={15} />{candidate.email}</span><span><Icon name="location" size={15} />{candidate.location || 'Location not provided'}</span></div>
        <div className="drawer-section"><label className="field-label">Hiring stage<select className="form-control" value={candidate.stage} onChange={(event) => onStageChange(event.target.value as CandidateStage)}>{candidateStages.map((stage) => <option key={stage}>{stage}</option>)}</select></label></div>
        <div className="drawer-section"><div className="drawer-section-title"><h3>Experience</h3><span>{candidate.experience}</span></div><p className="drawer-muted">Added {formattedDate(candidate.addedAt, { month: 'long', day: 'numeric', year: 'numeric' })}</p>{candidate.phone && <p className="drawer-muted">Phone {candidate.phone}</p>}{candidate.skills.length > 0 && <div className="skill-tags">{candidate.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>}</div>
        <div className="drawer-section">
          <div className="drawer-section-title">
            <div className="resume-heading"><h3>Resume summary</h3><Icon name="sparkle" size={16} /></div>
            <button
              className="resume-toggle"
              aria-expanded={showResume}
              onClick={() => setShowResume((current) => !current)}
            >
              <Icon name={showResume ? 'close' : 'file'} size={14} />
              {showResume ? 'Hide resume' : 'View full resume'}
            </button>
          </div>
          <div className="drawer-summary">
            {summary.length ? summary.map((sentence, index) => <p key={`${sentence}-${index}`}>{sentence}</p>) : <p>No resume text provided yet.</p>}
            <span className="source-citation"><Icon name="file" size={14} /> Source: {candidate.resumeName || 'candidate-provided resume text'}</span>
          </div>
          {showResume && <ResumeViewer candidate={candidate} />}
        </div>
        <div className="drawer-footer"><p>Summary is a reading aid, not an assessment. Your team makes every decision.</p><button className="button button-secondary" onClick={onClose}>Close profile</button></div>
      </aside>
    </div>
  )
}

function ResumeViewer({ candidate }: { candidate: Candidate }) {
  const [resume, setResume] = useState<{
    file: Blob | null
    fileName: string
    text: string | null
    error: string | null
  }>({ file: null, fileName: '', text: null, error: null })
  const [loading, setLoading] = useState(true)
  const [objectUrl, setObjectUrl] = useState('')

  useEffect(() => {
    let active = true
    let createdUrl = ''

    const loadResume = async () => {
      try {
        const stored = await getResumeDocument(candidate.id)
        if (!active) return

        if (!stored) {
          setResume({
            file: null,
            fileName: candidate.resumeText
              ? 'Candidate-provided resume text'
              : candidate.resumeName,
            text: candidate.resumeText || null,
            error: null,
          })
          setLoading(false)
          return
        }

        const isTextFile =
          stored.file.type === 'text/plain' ||
          stored.fileName.toLowerCase().endsWith('.txt')
        if (isTextFile) {
          setResume({
            file: stored.file,
            fileName: stored.fileName,
            text: await stored.file.text(),
            error: null,
          })
        } else {
          createdUrl = URL.createObjectURL(stored.file)
          setObjectUrl(createdUrl)
          setResume({
            file: stored.file,
            fileName: stored.fileName,
            text: null,
            error: null,
          })
        }
        setLoading(false)
      } catch (error) {
        console.error('Unable to open the candidate resume.', error)
        if (!active) return
        setResume({
          file: null,
          fileName: candidate.resumeName,
          text: candidate.resumeText || null,
          error: 'The saved resume file could not be opened. You can still review the supplied resume text.',
        })
        setLoading(false)
      }
    }

    void loadResume()
    return () => {
      active = false
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [candidate.id, candidate.resumeName, candidate.resumeText])

  const fileName = resume.fileName || 'Candidate-provided resume text'
  const isPdf =
    resume.file?.type === 'application/pdf' ||
    resume.fileName.toLowerCase().endsWith('.pdf')
  const isWordDocument = /\.(doc|docx)$/i.test(resume.fileName)

  return (
    <section className="resume-viewer" aria-label="Full resume">
      <div className="resume-viewer-heading">
        <span><Icon name="file" size={15} />{fileName}</span>
        {objectUrl && (
          <a className="resume-download" href={objectUrl} download={resume.fileName}>
            Download
          </a>
        )}
      </div>
      {loading && <p className="resume-viewer-message">Opening resume…</p>}
      {!loading && resume.error && <p className="resume-viewer-error" role="alert">{resume.error}</p>}
      {!loading && isPdf && objectUrl && (
        <iframe className="resume-pdf" src={objectUrl} title={`${candidate.name}'s resume`} />
      )}
      {!loading && !resume.file && resume.text && (
        <p className="resume-viewer-message">No saved file is available. Showing the resume text provided for this candidate.</p>
      )}
      {!loading && resume.text && <pre className="resume-text">{resume.text}</pre>}
      {!loading && isWordDocument && objectUrl && (
        <div className="resume-viewer-message">
          <p>This Word document can’t be previewed in the browser. Download the original file to view it.</p>
          <a className="button button-secondary" href={objectUrl} download={resume.fileName}>Download resume</a>
        </div>
      )}
      {!loading && resume.file && !resume.text && !isPdf && !isWordDocument && (
        <div className="resume-viewer-message">
          <p>This file type can’t be previewed in the browser. Download the original file to view it.</p>
          {objectUrl && <a className="button button-secondary" href={objectUrl} download={resume.fileName}>Download resume</a>}
        </div>
      )}
      {!loading && !resume.file && !resume.text && (
        <p className="resume-viewer-message">No uploaded resume file or resume text is available for this candidate.</p>
      )}
    </section>
  )
}

export default RecruitmentDashboard
