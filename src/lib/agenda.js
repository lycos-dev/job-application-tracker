import { daysBetween, followUp, localDate, shortDate } from './utils.js'

export function nextActions(rows,today){
  const deadlines = [], followups = []
  for (const row of rows) {
    if (row.stage === 'Saved' && row.deadline) {
      const days = daysBetween(today,row.deadline)
      if (days <= 7) deadlines.push({row,kind:'deadline',days,label:days < 0 ? 'Overdue · '+shortDate(row.deadline) :
        days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : 'Apply by '+shortDate(row.deadline)})
    } else if (followUp(row,today)) {
      const last = Math.max(Date.parse(row.stage_changed_at),Date.parse(row.last_followed_up_at)||0)
      const days = daysBetween(localDate(new Date(last)),today)
      followups.push({row,kind:'follow',days,label:days+' days since last activity'})
    }
  }
  deadlines.sort((a,b)=>a.days-b.days || a.row.company.localeCompare(b.row.company))
  followups.sort((a,b)=>b.days-a.days || a.row.company.localeCompare(b.row.company))
  return [...deadlines.filter(x=>x.days<=1),...followups,...deadlines.filter(x=>x.days>1)]
}
