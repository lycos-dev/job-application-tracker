export const STAGES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Closed']
export const TYPES = ['Job', 'Internship', 'Freelance', 'Other']
export const stageStyle = stage => ({ '--stage': 'var(--' + stage.toLowerCase() + ')' })

export function localDate(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part, i) =>
    String(part).padStart(i ? 2 : 4, '0')).join('-')
}

export function offsetDate(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return localDate(date)
}

export function shortDate(value) {
  return value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
    .format(new Date(value + 'T12:00:00')) : '—'
}

export function daysBetween(start, end) {
  return Math.round((Date.parse(end + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 86400000)
}

export function followUp(row, today = localDate()) {
  const activity = Math.max(Date.parse(row.stage_changed_at), Date.parse(row.last_followed_up_at) || 0)
  return row.stage === 'Applied' && daysBetween(localDate(new Date(activity)), today) >= 10
}

export function deadlineBadge(row, today) {
  if (!row.deadline || row.stage !== 'Saved') return null
  const days = daysBetween(today, row.deadline)
  return { tone: days < 0 ? 'late' : days <= 3 ? 'soon' : '', text:
    (days < 0 ? 'Deadline passed · ' : 'Apply by ') + shortDate(row.deadline) }
}

export function normalizeLink(value = '') {
  const input = value.trim()
  if (!input) return ''
  const invalid = () => new Error('Enter a valid http or https posting link.')
  if (/[\s\\\u0000-\u001f\u007f]/.test(input) || input.startsWith('//')) throw invalid()
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(input)
  const domainWithPort = /^[\w.-]+\.\w+:\d+(?:[/?#]|$)/i.test(input)
  if (hasScheme && !domainWithPort && !/^https?:\/\/[^/]/i.test(input)) throw invalid()
  let url
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : 'https://' + input)
  } catch { throw invalid() }
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw invalid()
  if (!hasScheme && !url.hostname.includes('.') && url.hostname !== 'localhost') throw invalid()
  return url.href
}

export function quickFields(value) {
  const input = value.trim()
  if (!input) throw new Error('Paste a posting link or enter a company name.')
  if (!/^[a-z][a-z\d+.-]*:/i.test(input) && !/^\/\//.test(input) &&
      !/^[^\s/]+\.[a-z]{2,}(?:[:/?#]|$)/i.test(input)) return { company: input }
  const link = normalizeLink(input)
  const host = new URL(link).hostname.replace(/^www\./, '')
  const labels = host.split('.')
  const offset = /\.(com|org|net|co)\.[a-z]{2}$/i.test(host) ? 3 : 2
  const company = (labels.at(-offset) || labels[0]).replace(/-/g, ' ')
  return { link, company: company.charAt(0).toUpperCase() + company.slice(1) }
}

export const formFields = ['company','role','stage','type','link','notes','applied_date','deadline','location','pay']
export function blank(stage = 'Applied') {
  return { company: '', role: '', stage, type: 'Job', link: '', notes: '', applied_date:
    stage === 'Saved' ? '' : localDate(), deadline: '', location: '', pay: '' }
}

export function cleanForm(input) {
  const row = Object.fromEntries(formFields.map(key => [key, String(input[key] ?? '').trim()]))
  if (!row.company) throw new Error('Enter a company or organization.')
  if (!STAGES.includes(row.stage) || !TYPES.includes(row.type)) throw new Error('Choose a listed stage and type.')
  row.link = normalizeLink(row.link)
  for (const key of ['deadline', 'applied_date']) {
    const date = row[key]
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date)) throw new Error('Enter a valid calendar date.')
  }
  return row
}

function rowId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0,8), hex.slice(8,12), hex.slice(12,16), hex.slice(16,20), hex.slice(20)].join('-')
}

export function createRow(fields, now = new Date()) {
  const clean = cleanForm({ ...blank(fields.stage), ...fields })
  if (clean.stage !== 'Saved' && !clean.applied_date) clean.applied_date = localDate(now)
  return { ...clean, id: rowId(), pinned: false, is_sample: false,
    created_at: now.toISOString(), stage_changed_at: now.toISOString(), updated_at: now.toISOString() }
}

export function updateRow(old, patch, now = new Date()) {
  const next = { ...old, ...cleanForm({ ...old, ...patch }), updated_at: now.toISOString() }
  if ('pinned' in patch) next.pinned = Boolean(patch.pinned)
  if (old.stage !== next.stage) {
    next.stage_changed_at = next.updated_at
    if (old.stage === 'Saved') next.applied_date = localDate(now)
  }
  return next
}

export function sortedRows(rows) {
  return [...rows].sort((a, b) => Number(b.pinned) - Number(a.pinned) ||
    (b.applied_date || b.created_at.slice(0, 10)).localeCompare(a.applied_date || a.created_at.slice(0, 10)) ||
    b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id))
}
