import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
function setup() {
  if (!url && !key) return { client: null, issue: '' }
  try {
    const endpoint = new URL(url)
    const local = ['localhost','127.0.0.1','[::1]'].includes(endpoint.hostname)
    if (endpoint.protocol !== 'https:' && !(local && endpoint.protocol === 'http:')) throw Error()
    if (!key?.startsWith('sb_publishable_')) {
      const part = key.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
      if (JSON.parse(atob(part)).role !== 'anon') throw Error()
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const client = createClient(url, key, {
      auth: { flowType: 'pkce', detectSessionInUrl: false },
      global: { fetch: (input, init = {}) => {
        const headers = new Headers(init.headers)
        if (String(input).startsWith(endpoint.origin + '/rest/v1/')) headers.append('Prefer', 'timezone=' + timezone)
        return fetch(input, { ...init, headers })
      } },
    })
    return { client, issue: '' }
  } catch {
    return { client: null, issue: 'Check the Supabase URL and public anon or publishable key in your environment, then restart the app.' }
  }
}
export const { client, issue: configIssue } = setup()
export const project = url || 'local'
