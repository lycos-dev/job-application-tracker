import { project } from './supabaseClient.js'
const key = id => 'application-tracker.cloud.v1:' + project + ':' + id

export function cachedRows(id) {
  try {
    const rows = JSON.parse(localStorage.getItem(key(id)))
    return Array.isArray(rows) && rows.every(row => row.user_id === id && row.id &&
      typeof row.company === 'string' && typeof row.created_at === 'string') ? rows : null
  } catch { return null }
}
export function cacheRows(id, rows) {
  try { localStorage.setItem(key(id), JSON.stringify(rows)) } catch { /* Session state remains available. */ }
}
export function forgetRows(id) {
  try { localStorage.removeItem(key(id)) } catch { /* Browser storage can be disabled. */ }
}
