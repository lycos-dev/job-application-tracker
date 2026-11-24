import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoadingSkeleton from './components/LoadingSkeleton.jsx'

import { useAuth } from './hooks/useAuth.js'
import { useTheme } from './hooks/useTheme.js'
import './styles/tokens.css'
import './styles/base.css'
import './styles/tracker.css'
import './styles/board.css'
import './styles/list.css'
import './styles/sheets.css'
import './styles/auth.css'
import './styles/workspace.css'

const Tracker = lazy(() => import('./pages/Tracker.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))

const AuthCallback = lazy(() => import('./pages/AuthCallback.jsx'))

function WorkspaceRoutes() {
  const theme = useTheme()
  const { user, loading, error } = useAuth()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const fragment = new URLSearchParams(location.hash.slice(1))
  const hasCallback = ['code','token_hash','error','error_code','access_token'].some(key => params.has(key) || fragment.has(key))
  const recovery = (params.get('type') || fragment.get('type')) === 'recovery'
  if (loading) return <LoadingSkeleton />
  const login = mode => <Login key={mode} mode={mode} user={user} authError={error} />
  const callback = reset => <AuthCallback key={location.key} recovery={reset} />
  return <Suspense fallback={<LoadingSkeleton />}><Routes>
    <Route path="/" element={hasCallback ? callback(recovery) : <Navigate replace to={user ? '/dashboard' : '/login'}/>} />
    {['dashboard','applications','follow-ups','account'].map(tab =>
      <Route key={tab} path={'/'+tab} element={user ? <Tracker key={user.id} user={user} theme={theme} tab={tab}/> : <Navigate to="/login" replace />}/>)}
    <Route path="/auth/callback" element={callback(recovery)} />
    <Route path="/confirm-email" element={login('confirm')} />
    <Route path="/login" element={login('login')} />
    <Route path="/signup" element={login('signup')} />
    <Route path="/forgot-password" element={login('forgot')} />
    <Route path="/reset-password" element={hasCallback ? <AuthCallback recovery /> : login('reset')} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>
}

export default function App() {
  return <BrowserRouter><WorkspaceRoutes /></BrowserRouter>
}
