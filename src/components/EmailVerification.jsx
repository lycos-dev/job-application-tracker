import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'

export default function EmailVerification({ initialEmail, recovery, justSent }) {
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [wait, setWait] = useState(justSent ? 60 : 0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const navigate = useNavigate()
  useEffect(() => {
    if (!wait) return
    const timer = setTimeout(() => setWait(wait - 1), 1000)
    return () => clearTimeout(timer)
  }, [wait])
  async function submit(event) {
    event.preventDefault()
    const resend = event.nativeEvent.submitter?.value === 'resend'
    if (lock.current || (resend && wait)) return
    const address = email.trim()
    if (!event.currentTarget.elements.email.reportValidity()) return
    lock.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (resend) {
        if (recovery) await api.requestReset(address)
        else await api.resendConfirmation(address)
        setWait(60)
        setNotice('If this address is eligible, a fresh email is on its way. Use the latest one.')
      } else {
        await api.verifyEmailCode(address, code.trim(), recovery)
        navigate(recovery ? '/reset-password' : '/dashboard', { replace: true })
      }
    } catch (err) {
      if (err.status === 429) setWait(60)
      setError(err.code === 'otp_expired' ? 'This code is invalid or expired. Check the latest email or request a new one.' : err.message)
    } finally { lock.current = false; setBusy(false) }
  }
  return <form className="auth-form" onSubmit={submit}><fieldset disabled={busy}>
    <label className="auth-field"><span>Email address</span><input required type="email" name="email" autoComplete="email"
      value={email} onChange={e => setEmail(e.target.value)}/></label>
    <label className="auth-field"><span>Email code</span><input name="code" className="otp-input" autoComplete="one-time-code"
      inputMode="numeric" pattern="[0-9]{6,10}" required value={code} maxLength={10}
      onChange={e => setCode(e.target.value.trim())}/></label>
    <button className="btn auth-primary" type="submit" value="verify">{busy ? 'Please wait…' : 'Verify code'}</button>
    <button className="soft-button" type="submit" value="resend" formNoValidate disabled={wait > 0}>
      {wait ? 'Resend available in '+wait+'s' : 'Resend email'}</button>
  </fieldset>{notice && <p role="status" className="notice-success">{notice}</p>}
    {error && <p role="alert" className="error">{error}</p>}</form>
}
