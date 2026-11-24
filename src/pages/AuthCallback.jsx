import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { finishAuth } from '../lib/api.js'
import Brand from '../components/Brand.jsx'

export default function AuthCallback({ recovery }) {
  const [href] = useState(() => window.location.href)
  const [approved, setApproved] = useState(() => !new URL(href).searchParams.has('token_hash'))
  const [error, setError] = useState('')
  const pending = useRef(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (!approved) return
    let active = true
    // Both Strict Mode effects observe the same one-use credential exchange.
    pending.current ??= finishAuth(href)
    pending.current.then(() => {
      if (active) navigate(recovery ? '/reset-password' : '/dashboard', { replace: true })
    }).catch(e => {
      if (active) setError(e.code === 'bad_code_verifier' || /code verifier|both auth code/i.test(e.message)
        ? 'This link needs the browser where you started. For email confirmation, you can also enter the code from your email.' : e.message)
    })
    return () => { active = false }
  }, [approved, href, navigate, recovery])
  const action = recovery ? 'Continue to reset password' : 'Confirm email'
  return <main className="account callback-panel"><Brand/><section className="account-panel">
    <h1>{error ? 'Check your link' : approved ? 'Signing you in' : recovery ? 'Reset your password' : 'Confirm your email'}</h1>
    {error ? <><p role="alert">{error}</p><div className="sent-actions">
      <Link className="btn" replace to={recovery ? '/forgot-password' : '/login'}>{recovery ? 'Request a reset email' : 'Back to login'}</Link>
      {!recovery && <Link className="back-login" replace to="/confirm-email">Enter a code or resend confirmation</Link>}
    </div></> : approved ? <p role="status">Verifying your session…</p> :
      <><p>Continue to verify this request for your Roleward account.</p><button className="btn" onClick={() => setApproved(true)}>{action}</button></>}
  </section></main>
}
