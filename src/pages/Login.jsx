import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'
import EmailVerification from '../components/EmailVerification.jsx'
import Brand from '../components/Brand.jsx'
import Icon from '../components/Icon.jsx'

const titles = { confirm:'Confirm your email', login:'Welcome back', signup:'Create your account', forgot:'Reset your password', reset:'Choose a new password' }
const captions = { login:'Sign in to your application workspace.',signup:'Keep your applications and next steps together across devices.',
  forgot:'Enter the email you used to create your account.',reset:'Use at least eight characters.' }

function PasswordField({ label, name, existing=false }) {
  const [visible,setVisible] = useState(false)
  return <label className="auth-field"><span>{label}</span><span className="password-wrap">
    <input name={name} type={visible?'text':'password'} autoComplete={existing?'current-password':'new-password'}
      minLength={existing?1:8} required aria-label={label}/>
    <button type="button" onClick={()=>setVisible(!visible)} aria-label={(visible?'Hide ':'Show ')+label.toLowerCase()}
      aria-pressed={visible}><Icon name="eye" size={17}/></button></span></label>
}

export default function Login({ mode='login', user, authError }) {
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [sent,setSent]=useState('')
  const [justSent,setJustSent]=useState(false)
  const lock=useRef(false)
  const navigate=useNavigate()
  const authEntry=mode==='login'||mode==='signup'
  const recovery=mode==='reset'
  useEffect(()=>{document.title=titles[mode]+' · Roleward™'},[mode])
  if (user && (authEntry || mode==='confirm')) return <Navigate replace to="/dashboard"/>
  async function run(fn){
    if(lock.current) return
    lock.current=true; setBusy(true); setError('')
    try { await fn() } catch(e){ setError(e.message) }
    finally { lock.current=false; setBusy(false) }
  }
  function submit(event){
    event.preventDefault()
    const fields=new FormData(event.currentTarget)
    const email=String(fields.get('email')||'').trim()
    const password=String(fields.get('password')||'')
    run(async()=>{
      if ((mode==='signup'||recovery) && password!==fields.get('confirm')) throw Error('Your passwords don’t match.')
      if (!api.cloudEnabled) throw Error(api.configIssue || 'Account services are unavailable. Please try again later.')
      if(mode==='signup'){
        const data=await api.signUp(email,password)
        if(data.session) navigate('/dashboard',{replace:true})
        else { setJustSent(true); setSent(email) }
      } else if(mode==='forgot'){ await api.requestReset(email); setJustSent(true); setSent(email) }
      else if(recovery){ await api.changePassword(password); navigate('/account',{replace:true,state:{message:'Password updated.'}}) }
      else {
        try { await api.signIn(email,password) }
        catch (err) {
          if (err.code !== 'email_not_confirmed') throw err
          setSent(email)
          return
        }
        navigate('/dashboard',{replace:true})
      }
    })
  }
  return <main className="auth-layout">
    <aside className="auth-art"><Brand/>
      <div className="art-content"><h2>Application<br/>tracker<span>.</span></h2>
        <p>Track your applications, deadlines, and next steps.</p>
        <div className="paper-stack" aria-hidden="true">{[['Saved','saved'],['Applied','applied'],['Interviewing','interviewing']].map(([label,stage],i)=>
          <div className={'paper paper-'+i} key={stage} style={{'--stage':'var(--'+stage+')'}}><div><i/>{label}</div><span/><span/></div>)}</div>
      </div>
      <span className="maker">Designed by Lycos Blanza</span>
    </aside>
    <section className="auth-form-area"><div className="auth-form-card">
      <div className="mobile-brand"><Brand/></div>
      {authEntry && !sent && <nav className="auth-tabs" aria-label="Account access">
        <Link to="/login" aria-current={mode==='login'?'page':undefined}>Log in</Link>
        <Link to="/signup" aria-current={mode==='signup'?'page':undefined}>Sign up</Link></nav>}
      <h1>{sent ? 'Check your email' : titles[mode]}</h1>
      <p className="auth-caption">{sent || mode==='confirm' ?
        'Open the link in your latest email, or enter the code below.' : captions[mode]}</p>
      {sent || mode==='confirm' ? <>
        <EmailVerification initialEmail={sent} recovery={mode==='forgot'} justSent={justSent}/>
        <Link className="back-login" to="/login" onClick={()=>setSent('')}>Back to login</Link></> :
      recovery && !user ? <Link className="btn" to="/forgot-password">Request a fresh reset link</Link> :
      <form onSubmit={submit} className="auth-form"><fieldset disabled={busy}>
        {!recovery && <label className="auth-field"><span>Email address</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label>}
        {mode!=='forgot' && <PasswordField label={recovery?'New password':'Password'} name="password" existing={mode==='login'}/>}
        {(recovery||mode==='signup') && <><p className="field-help">At least 8 characters.</p><PasswordField label="Confirm password" name="confirm"/></>}
        {mode==='login' && <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>}
        <button className="btn auth-primary">{busy?'Please wait…':{login:'Log in',signup:'Create account',forgot:'Send reset link',reset:'Save password'}[mode]}<Icon name="arrow" size={16}/></button>
        {authEntry && api.cloudEnabled && <button className="btn ghost google-btn" type="button" onClick={()=>run(api.google)}>Continue with Google</button>}
      </fieldset></form>}
      {(error||authError||api.configIssue) && <p role="alert" className="error">{error||authError||api.configIssue}</p>}
      {!sent && !authEntry && mode!=='confirm' && <Link className="back-login" to="/login">← Back to login</Link>}
      {!sent && mode==='login' && <Link className="back-login" to="/confirm-email">Need to confirm your email?</Link>}
    </div></section>
  </main>
}
