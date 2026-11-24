import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'

const titles = {login:'Sign in',signup:'Create account',forgot:'Reset password',reset:'Set new password'}
export default function Login({ mode = 'login', user, authError }) {
  const [error,setError] = useState('')
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)
  const lock = useRef(false)
  const navigate = useNavigate()
  if (user && ['login','signup'].includes(mode)) return <Navigate replace to="/" />
  const reset = mode === 'reset'
  const ready = api.cloudEnabled && (!reset || user)
  async function run(action) {
    if (lock.current) return
    lock.current = true
    setBusy(true); setError(''); setMessage('')
    try { await action() } catch(e) { setError(e.message) }
    finally { setBusy(false); lock.current = false }
  }
  function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')
    run(async () => {
      if (mode === 'forgot') {
        await api.requestReset(email)
        setMessage('If this email has an account, a reset link is on its way. Open it in this browser.')
      } else if (reset) {
        if (password !== form.get('confirmation')) throw new Error('The passwords must match.')
        await api.changePassword(password)
        navigate('/account',{replace:true,state:{message:'Password updated.'}})
      } else if (mode === 'signup') {
        const result = await api.signUp(email,password)
        if (result.session) navigate('/',{replace:true})
        else setMessage('Check your inbox and open the confirmation link in this browser.')
      } else {
        await api.signIn(email,password)
        navigate('/',{replace:true})
      }
    })
  }
  return <main className="account"><Link className="back" to={user ? '/' : '/local'}>← Application Tracker</Link>
    <section className="account-panel"><h1>{titles[mode]}</h1>
      {!api.cloudEnabled && <p className="account-notice">{api.configIssue || 'This copy uses device storage. Connect Supabase to enable cloud accounts.'}</p>}
      {reset && !user && api.cloudEnabled && <p>Open the latest recovery email or request another link.</p>}
      <form onSubmit={submit}><fieldset disabled={!ready || busy}>
        {!reset && <label>Email address<input name="email" type="email" autoComplete="email" required/></label>}
        {mode !== 'forgot' && <label>{reset ? 'New password' : 'Password'}<input name="password" type="password"
          minLength={mode === 'login' ? 1 : 8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required/></label>}
        {reset && <label>Confirm new password<input name="confirmation" type="password" autoComplete="new-password" required/></label>}
        <button className="btn">{busy ? 'Please wait…' : mode === 'forgot' ? 'Send reset link' : titles[mode]}</button>
        {['login','signup'].includes(mode) && <button type="button" className="btn ghost" onClick={() => run(api.google)}>Continue with Google</button>}
      </fieldset></form>
      {(error || authError) && <p className="error" role="alert">{error || authError}</p>}
      {message && <p role="status" className="notice-success">{message}</p>}
      <nav className="account-links">{mode === 'login' ? <><Link to="/signup">Create account</Link><Link to="/forgot-password">Forgot password?</Link></> :
        <Link to={reset && !user ? '/forgot-password' : '/login'}>{reset && !user ? 'Request another link' : 'Back to sign in'}</Link>}</nav>
      <Link className="btn ghost local-action" to="/local">Continue on this device</Link>
    </section></main>
}
