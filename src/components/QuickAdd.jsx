import { useRef, useState } from 'react'
export default function QuickAdd({ onQuick }) {
  const [text,setText] = useState('')
  const [error,setError] = useState('')
  const pending = useRef(false)
  return <><form className="quick" onSubmit={async e => {
    e.preventDefault()
    if (pending.current) return
    pending.current = true
    try { await onQuick(text); setText(''); setError('') } catch (err) { setError(err.message) }
    finally { pending.current = false }
  }}>
    <input aria-label="Quick save" placeholder="Job link or company" value={text}
      onChange={e => { setText(e.target.value); setError('') }} required />
    <button className="btn">Save for later</button>
  </form>{error && <p className="error" role="alert">{error}</p>}</>
}
