import { useEffect, useState } from 'react'
import { cloudEnabled, onAuth, session } from '../lib/api.js'
import { forgetRows } from '../lib/cache.js'

export function useAuth() {
  const [state,setState] = useState({ user:null, loading:cloudEnabled, error:'' })
  useEffect(() => {
    if (!cloudEnabled) return
    let active = true
    let received = false
    let previous
    const apply = value => {
      const user = value?.user ?? null
      if (previous && previous !== user?.id) forgetRows(previous)
      previous = user?.id
      if (active) setState({user, loading:false, error:''})
    }
    const off = onAuth((_event, value) => { received = true; apply(value) })
    session().then(value => { if (active && !received) apply(value) }).catch(e => {
      if (active && !received) setState({user:null,loading:false,error:e.message})
    })
    return () => { active = false; off() }
  },[])
  return state
}
