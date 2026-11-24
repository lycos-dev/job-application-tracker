import { useRef, useState } from 'react'
import Sheet from './Sheet.jsx'
import { cleanForm, formFields, STAGES, TYPES } from '../lib/utils.js'

export default function EditorSheet({ initial, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(initial)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')
  const [discard,setDiscard] = useState(false)
  const dirty = formFields.some(key => (draft[key] ?? '') !== (initial[key] ?? ''))
  const busy = useRef(false)
  function requestClose() {
    if (busy.current) return
    if (dirty) { setDiscard(true); setConfirm(false) }
    else onClose()
  }
  const [pending, setPending] = useState(false)
  const bind = key => ({ value: draft[key] ?? '', onChange: e => {
    setDraft(prev => ({ ...prev, [key]: e.target.value })); setConfirm(false); setError('')
  } })
  const input = (caption, key, type = 'text', attrs = {}) =>
    <label>{caption}<input type={type} {...bind(key)} {...attrs} /></label>
  async function submit(action) {
    if (busy.current) return
    busy.current = true
    setPending(true)
    try { await action(); onClose() }
    catch (e) { setError(e.message) }
    finally { busy.current = false; setPending(false) }
  }
  function save(event) {
    event.preventDefault()
    submit(() => {
      const clean = cleanForm(draft)
      const fields = initial.id ? Object.fromEntries(formFields.filter(k => clean[k] !== (initial[k] || '')).map(k => [k,clean[k]])) : clean
      return onSave(initial.id, fields)
    })
  }
  return <Sheet title={initial.id ? 'Edit opportunity' : 'New opportunity'} onClose={requestClose}>
    {discard ? <div className="discard-panel"><h3>Discard unsaved changes?</h3><p>Your last saved version will be kept.</p>
      <div className="sheet-actions"><button className="btn ghost" onClick={onClose}>Discard changes</button>
      <button className="btn" autoFocus onClick={() => setDiscard(false)}>Keep editing</button></div></div> : <form onSubmit={save}>
      <div className="sheet-body">
        {input('Company or organization', 'company', 'text', { required: true, autoFocus: true, autoComplete: 'organization' })}
        {input('Role', 'role')}
        <div className="fields-pair">
          <label>Stage<select {...bind('stage')}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label>Type<select {...bind('type')}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
        </div>
        {input('Link to the posting', 'link', 'text', { placeholder: 'https://…', inputMode: 'url', autoCapitalize: 'none' })}
        <label>Notes<textarea rows="3" {...bind('notes')} placeholder="Contacts, requirements, or next steps…" /></label>
        <details><summary>More details</summary>
          <div className="fields-pair">{input('Applied date', 'applied_date', 'date')}{input('Apply by', 'deadline', 'date')}</div>
          <div className="fields-pair">{input('Location / setup', 'location')}{input('Pay', 'pay')}</div>
        </details>
        {error && <p role="alert" className="error">{error}</p>}
        {confirm && <p role="alert">Delete this application and its notes?</p>}
      </div>
      <footer className="sheet-actions">
        {initial.id && <button type="button" disabled={pending} className="btn ghost danger" onClick={() =>
          confirm ? submit(() => onDelete(initial.id)) : setConfirm(true)}>{confirm ? 'Confirm delete' : 'Delete'}</button>}
        <button type="button" disabled={pending} className="btn ghost push" onClick={requestClose}>Cancel</button>
        <button className="btn" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
      </footer>
    </form>}
  </Sheet>
}
