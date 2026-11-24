import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'
import * as local from '../lib/localWorkspace.js'

export default function Account({ user }) {
  const [enabled,setEnabled] = useState(false)
  const [ready,setReady] = useState(false)
  const [busy,setBusy] = useState(false)
  const [confirm,setConfirm] = useState(false)
  const { state } = useLocation()
  const [message,setMessage] = useState(state?.message || '')
  const [error,setError] = useState('')
  const navigate = useNavigate()
  const [deviceRows] = useState(() => {
    local.refresh()
    return local.getSnapshot().rows.filter(row => !row.is_sample)
  })
  useEffect(() => {
    let active = true
    api.reminderSetting(user.id).then(row => {
      if (active) { setEnabled(Boolean(row?.enabled)); setReady(true) }
    }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  },[user.id])
  async function run(fn) {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try { await fn() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <main className="account"><Link className="back" to="/">← Back to tracker</Link>
    <section className="account-panel"><h1>Your account</h1><p>{user.email}</p>
      <section><h2>Email reminders</h2><p>Get one daily email when a Saved deadline is within three days or an Applied item needs a follow-up.</p>
        <label className="check"><input type="checkbox" checked={enabled} disabled={!ready || busy}
          onChange={e => { const value = e.target.checked; run(async () => {
            setEnabled(value)
            try { await api.setReminders(user.id,value); setMessage('Reminder preference saved.') }
            catch (error) { setEnabled(!value); throw error }
          }) }} />Daily reminders</label></section>
      <section><h2>Device applications</h2>
        <p>{deviceRows.length} personal {deviceRows.length === 1 ? 'application' : 'applications'} in this browser’s local workspace.</p>
        {deviceRows.length > 0 && <button className="btn ghost" disabled={busy} onClick={() => {
          if (!confirm) { setConfirm(true); return }
          run(async () => {
            const count = await api.importRows(user.id,deviceRows)
            setMessage(count + ' added to this account. Your device copy is still available.'); setConfirm(false)
          })
        }}>{confirm ? 'Confirm import to ' + user.email : 'Import device applications'}</button>}
        <Link className="back" to="/local">Open local workspace</Link>
      </section>
      {message && <p role="status" className="notice-success">{message}</p>}
      {error && <p role="alert" className="error">{error}</p>}
      <div className="account-controls"><Link to="/reset-password">Change password</Link>
        <button className="btn ghost" disabled={busy} onClick={() => run(async () => { await api.signOut(); navigate('/login',{replace:true}) })}>Sign out</button></div>
    </section></main>
}
