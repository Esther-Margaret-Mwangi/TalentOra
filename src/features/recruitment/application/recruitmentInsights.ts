import type { Candidate, Job, RecruitmentState } from '../domain/models'

export function getStageCounts(candidates: Candidate[]) {
  return [
    { stage: 'Applied', count: candidates.filter((c) => c.stage === 'Applied').length },
    { stage: 'Screening', count: candidates.filter((c) => c.stage === 'Screening').length },
    { stage: 'Interview', count: candidates.filter((c) => c.stage === 'Interview').length },
    { stage: 'Offer', count: candidates.filter((c) => c.stage === 'Offer').length },
    { stage: 'Hired', count: candidates.filter((c) => c.stage === 'Hired').length },
  ]
}

export function getJobApplicantCount(state: RecruitmentState, jobId: string) {
  return state.candidates.filter((candidate) => candidate.jobId === jobId).length
}

export function getResumeSummary(candidate: Candidate): string[] {
  const sentences = candidate.resumeText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  return sentences.slice(0, 3)
}

export function createInterviewQuestions(job: Job): string[] {
  const requirements = job.requirements
    .split(/\n|,|;/)
    .map((requirement) => requirement.trim().replace(/^[-•]\s*/, ''))
    .filter(Boolean)
    .slice(0, 4)

  if (requirements.length === 0) {
    return [
      `What interests you about the ${job.title} role?`,
      'Tell me about a project you are proud of and how you approached it.',
      'What would you like to learn more about from the team?',
    ]
  }

  return requirements.map(
    (requirement) =>
      `Can you share a specific example of how you have used ${requirement.toLowerCase()}?`,
  )
}
