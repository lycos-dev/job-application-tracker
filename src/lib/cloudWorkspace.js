import { createRow, updateRow } from './utils.js'
import { sampleData } from './sampleData.js'

// Only acknowledged rows go into the durable cache. Pending changes are overlays.
export function cloudWorkspace(userId, remote, cache) {
  const saved = cache.read(userId)
  let base = saved || []
  let loaded = saved !== null
  let status = 'Connecting'
  let error = ''
  let snapshot
  let epoch = 0
  let unsubscribe, timer, poll
  const listeners = new Set()
  const pending = new Set()

  function project() {
    let rows = base
    for (const operation of pending) rows = operation.preview(rows)
    snapshot = { rows, loading: !loaded && !error, pending: pending.size, error, status }
    for (const fn of listeners) fn()
  }
  project()

  async function refresh() {
    if (!listeners.size || pending.size) return
    const ticket = ++epoch
    try {
      if (!navigator.onLine) throw new Error('Offline. Reconnect to sync changes.')
      const rows = await remote.loadRows(userId)
      if (ticket !== epoch) return
      base = rows
      loaded = true
      error = ''
      cache.write(userId,base)
    } catch (e) {
      if (ticket !== epoch) return
      error = e.message
    }
    project()
  }

  function schedule() {
    clearTimeout(timer)
    if (listeners.size) timer = setTimeout(refresh, 60)
  }
  function network() {
    status = navigator.onLine ? 'Connecting' : 'Offline'
    project()
    schedule()
  }
  function subscribe(listener) {
    listeners.add(listener)
    if (listeners.size === 1) {
      let connected = false
      unsubscribe = remote.watchRows(userId,schedule, state => {
        if (!listeners.size) return
        connected = state === 'SUBSCRIBED'
        status = !navigator.onLine ? 'Offline' : connected ? 'Live' : 'Reconnecting'
        project()
        if (connected) schedule()
      })
      window.addEventListener('focus',schedule)
      window.addEventListener('online',network)
      window.addEventListener('offline',network)
      poll = setInterval(() => { if (!connected && navigator.onLine) schedule() },30000)
      refresh()
    }
    return () => {
      listeners.delete(listener)
      if (listeners.size) return
      epoch++
      clearTimeout(timer)
      clearInterval(poll)
      window.removeEventListener('focus',schedule)
      window.removeEventListener('online',network)
      window.removeEventListener('offline',network)
      unsubscribe?.()
    }
  }

  async function mutate(ids, preview, commit) {
    if (!navigator.onLine) throw new Error('You’re offline. Reconnect to save this change.')
    if ([...pending].some(op => ids.some(id => op.ids.includes(id)))) throw new Error('This application is still saving. Try again in a moment.')
    const op = { ids, preview }
    epoch++
    pending.add(op)
    project()
    try {
      const { apply, result } = await commit()
      base = apply(base)
      if (listeners.size) cache.write(userId,base)
      return result
    } finally {
      pending.delete(op)
      project()
      schedule()
    }
  }
  const without = (rows,id) => rows.filter(row => row.id !== id)
  const replace = (rows,row) => [row,...without(rows,row.id)]
  function current(id, revision) {
    const row = base.find(item => item.id === id)
    if (!row || (revision && row.updated_at !== revision)) throw new Error('This application changed. Open the latest version to continue.')
    return row
  }

  return {
    subscribe, getSnapshot: () => snapshot, refresh,
    async add(fields) {
      const row = { ...createRow(fields), user_id:userId }
      return mutate([row.id], rows => replace(rows,row), async () => {
        const [stored] = await remote.insertRows(userId,[row])
        return { apply: rows => replace(rows,stored), result:stored }
      })
    },
    async update(id, fields, revision) {
      const old = current(id,revision)
      const next = updateRow(old,fields)
      const patch = Object.fromEntries(Object.keys(fields).map(k => [k,next[k]]))
      if (!Object.keys(patch).length) return old
      return mutate([id],rows => replace(rows,next), async () => {
        const stored = await remote.changeRow(userId,id,patch,old.updated_at)
        return { apply: rows => replace(rows,stored), result:stored }
      })
    },
    async recordFollowUp(id,revision) {
      const row = current(id,revision)
      if (row.stage !== 'Applied') throw new Error('Only Applied items can be followed up.')
      const next = { ...row,last_followed_up_at:new Date().toISOString() }
      return mutate([id],rows => replace(rows,next),async () => {
        const stored = await remote.logFollowUp(userId,id,row.updated_at)
        return { apply:rows => replace(rows,stored),result:stored }
      })
    },
    async remove(id,revision) {
      const old = current(id,revision)
      return mutate([id],rows => without(rows,id),async () => {
        await remote.deleteRow(userId,id,old.updated_at)
        return { apply: rows => without(rows,id) }
      })
    },
    async addSamples() {
      if (snapshot.rows.some(row => row.is_sample)) return
      const samples = sampleData()
      // Stable per-account IDs make repeated loads from two devices converge.
      for (const row of samples) {
        const hash = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(userId + ':sample:' + row.company))
        const h = Array.from(new Uint8Array(hash),b => b.toString(16).padStart(2,'0')).join('')
        row.id = [h.slice(0,8),h.slice(8,12),'5'+h.slice(13,16),'a'+h.slice(17,20),h.slice(20,32)].join('-')
        row.user_id = userId
      }
      return mutate(['samples', ...samples.map(row => row.id)],rows => [...rows,...samples],async () => {
        const stored = await remote.insertRows(userId,samples,true)
        return { apply: rows => stored.reduce(replace,rows) }
      })
    },
    async clearSamples() {
      const keep = rows => rows.filter(row => !row.is_sample)
      return mutate(['samples', ...snapshot.rows.filter(row => row.is_sample).map(row => row.id)],keep,async () => {
        await remote.deleteSamples(userId)
        return { apply:keep }
      })
    },
  }
}
