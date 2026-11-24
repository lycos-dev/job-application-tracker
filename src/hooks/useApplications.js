import { useMemo, useSyncExternalStore } from 'react'
import * as remote from '../lib/api.js'
import { cachedRows, cacheRows } from '../lib/cache.js'
import { cloudWorkspace } from '../lib/cloudWorkspace.js'

export function useApplications(userId) {
  const api = useMemo(() => cloudWorkspace(userId,remote,{read:cachedRows,write:cacheRows}),[userId])
  const snapshot = useSyncExternalStore(api.subscribe,api.getSnapshot)
  return { ...snapshot, api }
}
