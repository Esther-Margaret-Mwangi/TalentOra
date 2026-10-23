import type {
  Activity,
  Candidate,
  Interview,
  Job,
  RecruitmentState,
} from '../domain/models'
import { candidateStages } from '../domain/models'

const storageKey = 'talentora.recruitment.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isJob(value: unknown): value is Job {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.department === 'string' &&
    typeof value.location === 'string' &&
    typeof value.type === 'string' &&
    (value.status === 'Open' || value.status === 'Draft' || value.status === 'Closed') &&
    typeof value.description === 'string' &&
    typeof value.requirements === 'string' &&
    typeof value.createdAt === 'string'
  )
}

function isCandidate(value: unknown): value is Candidate {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.phone === 'string' &&
    typeof value.location === 'string' &&
    typeof value.jobId === 'string' &&
    candidateStages.some((stage) => stage === value.stage) &&
    typeof value.experience === 'string' &&
    Array.isArray(value.skills) &&
    value.skills.every((skill) => typeof skill === 'string') &&
    typeof value.resumeName === 'string' &&
    typeof value.resumeText === 'string' &&
    typeof value.addedAt === 'string'
  )
}

function isInterview(value: unknown): value is Interview {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.candidateId === 'string' &&
    typeof value.jobId === 'string' &&
    typeof value.date === 'string' &&
    typeof value.time === 'string' &&
    typeof value.kind === 'string'
  )
}

function isActivity(value: unknown): value is Activity {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.message === 'string' &&
    typeof value.date === 'string'
  )
}

function isRecruitmentState(value: unknown): value is RecruitmentState {
  return (
    isRecord(value) &&
    Array.isArray(value.jobs) &&
    value.jobs.every(isJob) &&
    Array.isArray(value.candidates) &&
    value.candidates.every(isCandidate) &&
    Array.isArray(value.interviews) &&
    value.interviews.every(isInterview) &&
    Array.isArray(value.activities) &&
    value.activities.every(isActivity)
  )
}

const daysFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export function createInitialRecruitmentState(): RecruitmentState {
  const jobs: Job[] = [
    {
      id: 'job-product-designer',
      title: 'Senior Product Designer',
      department: 'Design',
      location: 'Remote · US',
      type: 'Full-time',
      status: 'Open',
      description:
        'Shape thoughtful product experiences from early discovery through launch. You will work closely with product and engineering to make complex workflows feel simple.',
      requirements:
        '5+ years designing digital products\nStrong portfolio in interaction design\nExperience with Figma and design systems\nComfortable partnering with engineering',
      createdAt: daysFromNow(-18),
    },
    {
      id: 'job-software-engineer',
      title: 'Software Engineer, Frontend',
      department: 'Engineering',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Open',
      description:
        'Build fast, accessible experiences for our customers. Help evolve our frontend platform and ship well-crafted features with a collaborative team.',
      requirements:
        '3+ years building web applications\nStrong TypeScript and React experience\nAccessibility and performance fundamentals\nEnjoys thoughtful code reviews',
      createdAt: daysFromNow(-12),
    },
    {
      id: 'job-growth-marketer',
      title: 'Growth Marketing Manager',
      department: 'Marketing',
      location: 'Hybrid · Austin, TX',
      type: 'Full-time',
      status: 'Open',
      description:
        'Develop experiments across our growth channels and turn customer insight into measurable, sustainable growth.',
      requirements:
        '4+ years in growth or performance marketing\nExperience building channel experiments\nStrong analytical and communication skills',
      createdAt: daysFromNow(-8),
    },
    {
      id: 'job-people-ops',
      title: 'People Operations Associate',
      department: 'People',
      location: 'Remote · US',
      type: 'Full-time',
      status: 'Draft',
      description:
        'Help create a welcoming, thoughtful employee experience from the first day onward.',
      requirements:
        'Experience in people operations or coordination\nClear, empathetic communication\nStrong attention to detail',
      createdAt: daysFromNow(-2),
    },
  ]

  const candidates: Candidate[] = [
    {
      id: 'candidate-olivia',
      name: 'Olivia Rhye',
      email: 'olivia.rhye@example.com',
      phone: '',
      location: 'Brooklyn, NY',
      jobId: 'job-product-designer',
      stage: 'Interview',
      experience: '7 years',
      skills: ['Product design', 'Figma', 'Design systems'],
      resumeName: 'Olivia_Rhye_Resume.pdf',
      resumeText:
        'Senior product designer with 7 years of experience building B2B products. Led a cross-functional redesign that improved task completion by 28%. Uses Figma and maintains a shared design system. Previously partnered with product and engineering teams at Northstar.',
      addedAt: daysFromNow(-12),
    },
    {
      id: 'candidate-marcel',
      name: 'Marcel King',
      email: 'marcel.king@example.com',
      phone: '',
      location: 'Queens, NY',
      jobId: 'job-software-engineer',
      stage: 'Screening',
      experience: '5 years',
      skills: ['React', 'TypeScript', 'Accessibility'],
      resumeName: 'Marcel_King_CV.pdf',
      resumeText:
        'Frontend engineer with 5 years of experience building React and TypeScript applications. Improved Core Web Vitals on a high-traffic commerce site and worked with product designers to deliver accessible interfaces.',
      addedAt: daysFromNow(-8),
    },
    {
      id: 'candidate-sienna',
      name: 'Sienna Blake',
      email: 'sienna.blake@example.com',
      phone: '',
      location: 'Austin, TX',
      jobId: 'job-growth-marketer',
      stage: 'Applied',
      experience: '6 years',
      skills: ['Growth marketing', 'Lifecycle', 'Analytics'],
      resumeName: 'Sienna_Blake_Resume.pdf',
      resumeText:
        'Growth marketer with 6 years of experience testing lifecycle and acquisition campaigns. Built a customer onboarding program and uses cohort analysis to measure retention.',
      addedAt: daysFromNow(-3),
    },
    {
      id: 'candidate-james',
      name: 'James Okafor',
      email: 'james.okafor@example.com',
      phone: '',
      location: 'Jersey City, NJ',
      jobId: 'job-product-designer',
      stage: 'Offer',
      experience: '8 years',
      skills: ['Product design', 'Discovery', 'Design systems'],
      resumeName: 'James_Okafor_CV.pdf',
      resumeText:
        'Product designer with 8 years across collaboration and productivity software. Led discovery workshops, built a component library, and partnered with engineers through implementation.',
      addedAt: daysFromNow(-16),
    },
    {
      id: 'candidate-priya',
      name: 'Priya Nair',
      email: 'priya.nair@example.com',
      phone: '',
      location: 'New York, NY',
      jobId: 'job-software-engineer',
      stage: 'Interview',
      experience: '4 years',
      skills: ['React', 'TypeScript', 'Testing'],
      resumeName: 'Priya_Nair_Resume.pdf',
      resumeText:
        'Software engineer with 4 years of experience in React, TypeScript, and frontend testing. Built an accessible component library and introduced visual regression tests.',
      addedAt: daysFromNow(-10),
    },
    {
      id: 'candidate-ethan',
      name: 'Ethan Cole',
      email: 'ethan.cole@example.com',
      phone: '',
      location: 'Remote · US',
      jobId: 'job-product-designer',
      stage: 'Screening',
      experience: '5 years',
      skills: ['Product design', 'Research', 'Prototyping'],
      resumeName: 'Ethan_Cole_Resume.pdf',
      resumeText:
        'Product designer with 5 years of experience in SaaS. Conducted customer interviews, prototyped workflows, and collaborated with engineering on responsive web applications.',
      addedAt: daysFromNow(-6),
    },
    {
      id: 'candidate-amara',
      name: 'Amara Williams',
      email: 'amara.williams@example.com',
      phone: '',
      location: 'Austin, TX',
      jobId: 'job-growth-marketer',
      stage: 'Interview',
      experience: '7 years',
      skills: ['Marketing', 'B2B SaaS', 'Experimentation'],
      resumeName: 'Amara_Williams_CV.pdf',
      resumeText:
        'Marketing leader with 7 years in B2B SaaS. Ran paid and lifecycle experiments, built marketing dashboards, and improved trial-to-paid conversion through onboarding tests.',
      addedAt: daysFromNow(-14),
    },
    {
      id: 'candidate-noah',
      name: 'Noah Chen',
      email: 'noah.chen@example.com',
      phone: '',
      location: 'New York, NY',
      jobId: 'job-software-engineer',
      stage: 'Hired',
      experience: '6 years',
      skills: ['React', 'Accessibility', 'Frontend'],
      resumeName: 'Noah_Chen_Resume.pdf',
      resumeText:
        'Frontend engineer with 6 years of experience building accessible web applications. Led frontend delivery for a customer portal and mentored engineers on component architecture.',
      addedAt: daysFromNow(-32),
    },
  ]

  const interviews: Interview[] = [
    {
      id: 'interview-olivia',
      candidateId: 'candidate-olivia',
      jobId: 'job-product-designer',
      date: daysFromNow(1).slice(0, 10),
      time: '10:30',
      kind: 'Portfolio review',
    },
    {
      id: 'interview-priya',
      candidateId: 'candidate-priya',
      jobId: 'job-software-engineer',
      date: daysFromNow(1).slice(0, 10),
      time: '13:00',
      kind: 'Technical conversation',
    },
    {
      id: 'interview-amara',
      candidateId: 'candidate-amara',
      jobId: 'job-growth-marketer',
      date: daysFromNow(2).slice(0, 10),
      time: '11:00',
      kind: 'Hiring manager chat',
    },
  ]

  const activities: Activity[] = [
    {
      id: 'activity-1',
      message: 'Olivia Rhye moved to Interview',
      date: daysFromNow(-1),
    },
    {
      id: 'activity-2',
      message: 'New application received for Growth Marketing Manager',
      date: daysFromNow(-1),
    },
    {
      id: 'activity-3',
      message: 'Noah Chen was marked as Hired',
      date: daysFromNow(-2),
    },
  ]

  return { jobs, candidates, interviews, activities }
}

export function readRecruitmentState(): {
  state: RecruitmentState
  error: string | null
} {
  try {
    const savedState = localStorage.getItem(storageKey)
    if (!savedState) {
      return { state: createInitialRecruitmentState(), error: null }
    }

    const parsed: unknown = JSON.parse(savedState)
    if (!isRecruitmentState(parsed)) {
      throw new Error('Saved recruitment data has an unexpected format.')
    }

    return { state: parsed, error: null }
  } catch (error) {
    console.error('Unable to load TalentOra data from this browser.', error)
    return {
      state: createInitialRecruitmentState(),
      error: 'Saved data could not be loaded. Your changes may not persist.',
    }
  }
}

export function saveRecruitmentState(state: RecruitmentState): void {
  localStorage.setItem(storageKey, JSON.stringify(state))
}

export function saveResumeFile(
  candidateId: string,
  file: File,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('talentora-files', 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore('resumes', { keyPath: 'candidateId' })
    }

    request.onerror = () => {
      reject(
        new Error(
          request.error?.message ?? 'The resume could not be saved locally.',
        ),
      )
    }

    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction('resumes', 'readwrite')
      transaction.objectStore('resumes').put({
        candidateId,
        file,
        fileName: file.name,
      })

      transaction.oncomplete = () => {
        database.close()
        resolve()
      }
      transaction.onerror = () => {
        database.close()
        reject(
          new Error(
            transaction.error?.message ??
              'The resume could not be saved locally.',
          ),
        )
      }
      transaction.onabort = () => {
        database.close()
        reject(
          new Error(
            transaction.error?.message ??
              'The resume could not be saved locally.',
          ),
        )
      }
    }
  })
}

export function readResumeFile(
  candidateId: string,
): Promise<{ file: Blob; fileName: string } | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('talentora-files', 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore('resumes', { keyPath: 'candidateId' })
    }

    request.onerror = () => {
      reject(
        new Error(
          request.error?.message ?? 'The resume could not be loaded locally.',
        ),
      )
    }

    request.onsuccess = () => {
      const database = request.result
      let transaction: IDBTransaction
      try {
        transaction = database.transaction('resumes', 'readonly')
      } catch (error) {
        database.close()
        reject(error)
        return
      }
      const getRequest = transaction
        .objectStore('resumes')
        .get(candidateId) as IDBRequest<
        { file?: Blob; fileName?: string } | undefined
      >

      getRequest.onsuccess = () => {
        const record = getRequest.result
        if (!record) {
          resolve(null)
          return
        }
        if (!(record.file instanceof Blob) || typeof record.fileName !== 'string') {
          reject(new Error('The saved resume has an unexpected format.'))
          return
        }
        resolve({ file: record.file, fileName: record.fileName })
      }

      getRequest.onerror = () => {
        reject(
          new Error(
            getRequest.error?.message ?? 'The resume could not be loaded locally.',
          ),
        )
      }

      transaction.oncomplete = () => database.close()
      transaction.onerror = () => {
        database.close()
        reject(
          new Error(
            transaction.error?.message ?? 'The resume could not be loaded locally.',
          ),
        )
      }
      transaction.onabort = () => {
        database.close()
        reject(
          new Error(
            transaction.error?.message ?? 'The resume could not be loaded locally.',
          ),
        )
      }
    }
  })
}
