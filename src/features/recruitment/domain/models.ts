export const candidateStages = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
] as const

export type CandidateStage = (typeof candidateStages)[number]
export type JobStatus = 'Open' | 'Draft' | 'Closed'

export interface Job {
  id: string
  title: string
  department: string
  location: string
  type: string
  status: JobStatus
  description: string
  requirements: string
  createdAt: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  location: string
  jobId: string
  stage: CandidateStage
  experience: string
  skills: string[]
  resumeName: string
  resumeText: string
  addedAt: string
}

export interface Interview {
  id: string
  candidateId: string
  jobId: string
  date: string
  time: string
  kind: string
}

export interface Activity {
  id: string
  message: string
  date: string
}

export interface RecruitmentState {
  jobs: Job[]
  candidates: Candidate[]
  interviews: Interview[]
  activities: Activity[]
}
