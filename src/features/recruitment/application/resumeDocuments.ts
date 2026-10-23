import { readResumeFile } from '../infrastructure/localRecruitmentStore'

export function getResumeDocument(candidateId: string) {
  return readResumeFile(candidateId)
}
