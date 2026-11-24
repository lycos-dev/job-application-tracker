import { createRow, offsetDate } from './utils.js'

export function sampleData() {
  const examples = [
    { company: 'Northwind Labs', role: 'Frontend Developer', stage: 'Saved', link: 'northwind.example/careers',
      deadline: offsetDate(4), location: 'Remote', notes: 'Strong team. Tailor CV to React work.' },
    { company: 'Contoso', role: 'Marketing Intern', stage: 'Applied', type: 'Internship',
      applied_date: offsetDate(-12), notes: 'Applied through the careers page.' },
    { company: 'Fabrikam', role: 'Data Analyst', stage: 'Interviewing', applied_date: offsetDate(-9),
      notes: 'Second interview on Friday.' },
    { company: 'Tailspin Studio', role: 'Freelance Designer', stage: 'Offer', type: 'Freelance',
      applied_date: offsetDate(-20), pay: 'Per project' },
  ]
  return examples.map(fields => {
    const row = createRow(fields)
    return { ...row, is_sample: true, pinned: row.stage === 'Saved',
      stage_changed_at: fields.applied_date ? new Date(fields.applied_date + 'T12:00:00').toISOString() : row.created_at }
  })
}
