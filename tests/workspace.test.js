import test from 'node:test'
import assert from 'node:assert/strict'
import { cloudWorkspace } from '../src/lib/cloudWorkspace.js'
import { createRow, updateRow, followUp, offsetDate } from '../src/lib/utils.js'

function setup(row, remote) {
  const cacheWrites = []
  const store = cloudWorkspace('owner',{
    watchRows:() => () => {}, loadRows:async () => [row], ...remote,
  },{read:() => [row],write:(_id,rows) => cacheWrites.push(rows)})
  return {store,cacheWrites}
}
test('failed optimistic stage change restores the confirmed row',async () => {
  const row = createRow({company:'A',stage:'Saved'})
  let reject
  const {store} = setup(row,{changeRow:() => new Promise((_resolve,r) => {reject=r})})
  const write = store.update(row.id,{stage:'Applied'})
  assert.equal(store.getSnapshot().rows[0].stage,'Applied')
  assert.equal(store.getSnapshot().pending,1)
  reject(new Error('Connection lost'))
  await assert.rejects(write,/Connection lost/)
  assert.equal(store.getSnapshot().rows[0].stage,'Saved')
  assert.equal(store.getSnapshot().pending,0)
})
test('an overlapping write cannot clobber a pending edit',async () => {
  const row = createRow({company:'A',stage:'Saved'})
  let complete
  const {store} = setup(row,{changeRow:() => new Promise(r => {complete=r})})
  const first = store.update(row.id,{pinned:true})
  await assert.rejects(store.update(row.id,{company:'B'}),/still saving/)
  complete({...row,pinned:true})
  await first
  assert.equal(store.getSnapshot().rows[0].pinned,true)
})
test('stale editor revisions are rejected before a request',async () => {
  const row = createRow({company:'A',stage:'Saved'})
  const {store} = setup(row,{})
  await assert.rejects(store.remove(row.id,'stale'),/latest version/)
  await assert.rejects(store.update(row.id,{notes:'old'},'stale'),/latest version/)
})
test('an old fetch cannot resurrect a row after an acknowledged delete',async () => {
  const row = createRow({company:'A',stage:'Saved'})
  let release
  const {store,cacheWrites} = setup(row,{loadRows:() => new Promise(r => {release=r}),deleteRow:async () => {}})
  const off=store.subscribe(() => {})
  try {
    await store.remove(row.id,row.updated_at)
    release([row])
    await Promise.resolve()
    assert.deepEqual(store.getSnapshot().rows,[])
    assert.deepEqual(cacheWrites.at(-1),[])
  } finally {off()}
})
test('edits preserve follow-up age, and leaving Saved sets the application date',() => {
  const row = createRow({company:'A',stage:'Applied'})
  row.stage_changed_at = new Date(offsetDate(-12)+'T12:00:00').toISOString()
  assert.equal(followUp(updateRow(row,{notes:'updated'})),true)
  assert.equal(followUp({...row,last_followed_up_at:new Date().toISOString()}),false)
  const saved = createRow({company:'B',stage:'Saved'})
  assert.equal(updateRow(saved,{stage:'Interviewing'},new Date('2026-11-01T12:00:00')).applied_date,'2026-11-01')
})

// Node's DOM-independent store tests use browser lifecycle and connection signals.
globalThis.window = new EventTarget()
Object.defineProperty(globalThis.navigator,'onLine',{value:true,configurable:true})
