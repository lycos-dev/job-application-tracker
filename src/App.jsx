import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoadingSkeleton from './components/LoadingSkeleton.jsx'

import { useAuth } from './hooks/useAuth.js'
import { cloudEnabled, configIssue } from './lib/api.js'
import { useTheme } from './hooks/useTheme.js'
import './styles/tokens.css'
import './styles/base.css'
import './styles/tracker.css'
import './styles/board.css'
import './styles/list.css'
import './styles/sheets.css'
import './styles/auth.css'

const Tracker = lazy(() => import('./pages/Tracker.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))

const Account = lazy(() => import('./pages/Account.jsx'))
const AuthCallback = lazy(() => import('./pages/AuthCallback.jsx'))

function WorkspaceRoutes() {
  const theme = useTheme()
  const { user, loading, error } = useAuth()
  const location = useLocation()
  const hasCallback = Boolean(location.search || location.hash)
  if (loading) return <LoadingSkeleton />
  const local = <Tracker key="local" theme={theme} />
  const login = mode => <Login key={mode} mode={mode} user={user} authError={error} />
  const guard = component => user ? component : <Navigate to="/login" replace />
  return <Suspense fallback={<LoadingSkeleton />}><Routes>
    <Route path="/" element={cloudEnabled || configIssue ? guard(<Tracker key={user?.id} user={user} theme={theme}/>) : local} />
    <Route path="/local" element={local} />
    <Route path="/account" element={guard(<Account key={user?.id} user={user} />)} />
    <Route path="/auth/callback" element={<AuthCallback recovery={new URLSearchParams(location.search).get('type') === 'recovery'} />} />
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
