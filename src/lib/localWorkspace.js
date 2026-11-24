// Local workspace adapter. Swapping the adapter does not change the component API.
import { cleanForm, createRow, updateRow } from './utils.js'
import { sampleData } from './sampleData.js'

const KEY = 'application-tracker.local.v1'
const listeners = new Set()
let snapshot

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

function reload() {
  try { snapshot = { rows: read(), error: '' } }
  catch { snapshot = { rows: snapshot?.rows ?? [], error: 'Could not read this browser’s saved applications. Check site storage and retry.' } }
  for (const listener of listeners) listener()
}

function onStorage(event) {
  if (event.key === KEY || event.key === null) reload()
}

export function subscribe(listener) {
  if (!listeners.size) {
    window.addEventListener('storage', onStorage)
    reload()
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) window.removeEventListener('storage', onStorage)
  }
}

export const getSnapshot = () => {
  if (!snapshot) reload()
  return snapshot
}
export const refresh = reload

async function write(change) {
  const commit = () => {
    let rows
    try { rows = read() } catch { throw new Error('Could not read saved applications. Your existing data has been preserved.') }
    const [next, result] = change(rows)
    try { localStorage.setItem(KEY, JSON.stringify(next)) }
    catch { throw new Error('Could not save on this device. Check browser storage and try again.') }
    snapshot = { rows: next, error: '' }
    for (const listener of listeners) listener()
    return result
  }
  return navigator.locks ? navigator.locks.request(KEY, commit) : commit()
}

export function add(fields) {
  return write(rows => {
    const row = createRow(fields)
    return [[row, ...rows], row]
  })
}

export function update(id, patch, revision) {
  return write(rows => {
    const old = rows.find(row => row.id === id)
    if (!old) throw new Error('This application has already been removed.')
    if (revision && old.updated_at !== revision) throw new Error('This application changed in another tab. Open the latest version to continue.')
    const next = updateRow(old, patch)
    return [rows.map(row => row.id === id ? next : row), next]
  })
}

export function recordFollowUp(id, revision) {
  return write(rows => {
    const row = rows.find(item => item.id === id)
    if (row?.stage !== 'Applied' || row.updated_at !== revision) throw new Error('Review the latest application before logging a follow-up.')
    const now = new Date().toISOString()
    const next = { ...row, last_followed_up_at:now, updated_at:now }
    return [rows.map(item => item.id === id ? next : item),next]
  })
}

export const remove = (id, revision) => write(rows => {
  const old = rows.find(row => row.id === id)
  if (old && revision && old.updated_at !== revision) throw new Error('This application changed. Review it before deleting.')
  return [rows.filter(row => row.id !== id)]
})
export const clearSamples = () => write(rows => [rows.filter(row => !row.is_sample)])
export const addSamples = () => write(rows => [rows.some(row => row.is_sample) ? rows : [...sampleData(), ...rows]])
