# TalentOra

TalentOra is a local-first recruitment dashboard built with Vite, React, TypeScript, and CSS. It includes a recruiter overview, vacancy management, a public careers page at `/careers`, a candidate pipeline, interview scheduling, recruitment analytics, and human-reviewed assistant demos.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run lint` and `npm run build` to validate changes.

## Local demo behavior

Jobs, candidates, interviews, and activity are stored in this browser's local storage. Resume files are stored in IndexedDB on this device. Recruiters can preview PDF and text resumes in a candidate profile; Word documents can be downloaded to open locally. Text resumes (`.txt`) can populate basic contact and skills fields; PDF and Word files are stored but not parsed. The resume summary and interview-question tools use transparent, rule-based local text—not a connected AI service. Calendar invitations, company accounts, backend APIs, and cross-device sync are not included.

Candidate summaries reference the supplied resume text as their source. The demo does not rank candidates or make hiring decisions.
