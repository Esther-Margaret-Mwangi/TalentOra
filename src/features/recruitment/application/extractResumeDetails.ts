const knownSkills = [
  'Accessibility',
  'Analytics',
  'Figma',
  'JavaScript',
  'Marketing',
  'Product design',
  'Python',
  'React',
  'Research',
  'SQL',
  'TypeScript',
]

export interface ResumeDetails {
  name: string
  email: string
  phone: string
  experience: string
  skills: string[]
}

export function extractResumeDetails(text: string): ResumeDetails {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? ''
  const phone = text.match(/(?:\+?\d[\d ().-]{7,}\d)/)?.[0]?.trim() ?? ''
  const years = text.match(/\b(\d{1,2})\+?\s+years?\b/i)?.[1]
  const lowerText = text.toLowerCase()
  const skills = knownSkills.filter((skill) => lowerText.includes(skill.toLowerCase()))

  return {
    name: lines[0]?.length <= 48 ? lines[0] : '',
    email,
    phone,
    experience: years ? `${years} years` : '',
    skills,
  }
}
