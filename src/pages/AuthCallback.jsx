import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { finishAuth } from '../lib/api.js'

export default function AuthCallback({ recovery }) {
  const [error,setError] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    let active = true
    finishAuth(window.location.href).then(() => {
      if (active) navigate(recovery ? '/reset-password' : '/', {replace:true})
    }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  },[navigate,recovery])
  return <main className="account"><section className="account-panel"><h1>{error ? 'Check your link' : 'Signing you in'}</h1>
    {error ? <><p role="alert">{error}</p><Link className="btn" to={recovery ? '/forgot-password' : '/login'}>Try again</Link></> :
    <p role="status">Verifying your session…</p>}</section></main>
}
