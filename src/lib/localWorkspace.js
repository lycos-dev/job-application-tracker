import { cleanForm, createRow } from './utils.js'

const KEY = 'application-tracker.local.v1'

function read() {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const legacy = localStorage.getItem('apptrk1')
    if (!legacy) return []
    const rows = JSON.parse(legacy).map(item => {
      const applied = item.stage !== 'Saved' ? item.date : ''
      const row = createRow({ ...item, location: item.where, applied_date: applied })
      return { ...row, pinned: !!item.pin, is_sample: !!item.sample,
        stage_changed_at: applied ? new Date(applied + 'T12:00:00').toISOString() : row.created_at }
    })
    localStorage.setItem(KEY, JSON.stringify(rows))
    return rows
  }
  const rows = JSON.parse(raw)
  if (!Array.isArray(rows)) throw new Error('Unexpected storage format.')
  for (const row of rows) {
    cleanForm(row)
    if (!row.id || !Number.isFinite(Date.parse(row.created_at)) ||
        !Number.isFinite(Date.parse(row.stage_changed_at))) throw new Error('Incomplete stored application.')
  }
  return rows
}

// Accounts can explicitly import records saved by earlier versions of the app.
export function readDeviceImport() {
  try { return { rows: read().filter(row => !row.is_sample), error: '' } }
  catch { return { rows: [], error: 'Could not read previous applications from this browser.' } }
}
