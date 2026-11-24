import { useMemo, useSyncExternalStore } from 'react'
import * as local from '../lib/localWorkspace.js'
import * as remote from '../lib/api.js'
import { cachedRows, cacheRows } from '../lib/cache.js'
import { cloudWorkspace } from '../lib/cloudWorkspace.js'

export function useApplications(userId) {
  const api = useMemo(() => userId ? cloudWorkspace(userId,remote,{read:cachedRows,write:cacheRows}) : local,[userId])
  const snapshot = useSyncExternalStore(api.subscribe,api.getSnapshot)
  return { ...snapshot, api }
}
