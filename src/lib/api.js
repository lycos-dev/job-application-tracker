import { client, configIssue } from './supabaseClient.js'
import { formFields } from './utils.js'

export const cloudEnabled = Boolean(client)
export { configIssue }
function db() {
  if (!client) throw new Error(configIssue || 'Connect Supabase to use an account.')
  return client
}
function checked({ data, error }) {
  if (error) throw new Error(error.message || 'The request failed. Try again.')
  return data
}
export const session = async () => checked(await db().auth.getSession()).session
export function onAuth(listener) {
  const { data } = db().auth.onAuthStateChange(listener)
  return () => data.subscription.unsubscribe()
}
const redirect = path => new URL(path, window.location.origin).href
export const signIn = async (email, password) => checked(await db().auth.signInWithPassword({ email, password }))
export const signUp = async (email, password) => checked(await db().auth.signUp({
  email, password, options: { emailRedirectTo: redirect('/auth/callback') },
}))
export const resendConfirmation = async email => checked(await db().auth.resend({
  type:'signup', email, options:{emailRedirectTo:redirect('/auth/callback')},
}))
export const google = async () => checked(await db().auth.signInWithOAuth({
  provider: 'google', options: { redirectTo: redirect('/auth/callback') },
}))
export const requestReset = async email => checked(await db().auth.resetPasswordForEmail(email, { redirectTo: redirect('/reset-password') }))
export const changePassword = async password => checked(await db().auth.updateUser({ password }))
export const signOut = async () => checked(await db().auth.signOut({ scope: 'local' }))

// React Strict Mode may mount a callback route twice. Exchange each one-use code once.
let callback
export function finishAuth(href) {
  if (callback?.href === href) return callback.promise
  const promise = (async () => {
    const url = new URL(href)
    const params = url.searchParams
    const fragment = new URLSearchParams(url.hash.slice(1))
    if (params.has('error') || fragment.has('error')) throw new Error('The sign-in link expired or was cancelled. Request a new one.')
    if (params.get('code')) return checked(await db().auth.exchangeCodeForSession(params.get('code')))
    const type = params.get('type')
    if (params.get('token_hash') && ['email','signup','recovery'].includes(type))
      return checked(await db().auth.verifyOtp({ token_hash: params.get('token_hash'), type }))
    throw new Error('Open the latest link from your email in the browser where you started.')
  })()
  callback = { href, promise }
  return promise
}

const table = () => db().from('applications')
export async function loadRows(userId) {
  const rows = []
  let cursor
  for (;;) {
    let query = table().select('*').eq('user_id',userId).order('id').limit(250)
    if (cursor) query = query.gt('id',cursor)
    const page = checked(await query)
    rows.push(...page)
    if (page.length < 250) return rows
    cursor = page.at(-1).id
  }
}

function payload(fields) {
  const entries = [...formFields, 'pinned'].filter(key => Object.hasOwn(fields,key)).map(key =>
    [key, fields[key] === '' && key !== 'company' ? null : fields[key]])
  return Object.fromEntries(entries)
}
export async function insertRows(userId, rows, samples = false) {
  const body = rows.map(row => ({ ...payload(row), id: row.id, user_id: userId, is_sample: samples }))
  const query = samples ? table().upsert(body, { onConflict: 'id', ignoreDuplicates: true }) : table().insert(body)
  return checked(await query.select('*'))
}
export async function changeRow(userId, id, patch, revision) {
  const row = checked(await table().update(payload(patch)).eq('user_id',userId).eq('id',id)
    .eq('updated_at',revision).select().maybeSingle())
  if (!row) throw new Error('This application changed on another device. Open the latest version and try again.')
  return row
}
export async function logFollowUp(userId,id,revision) {
  const row = checked(await db().rpc('record_tracker_follow_up',{
    expected_owner:userId, application_id:id, expected_revision:revision,
  }).maybeSingle())
  if (!row) throw new Error('Review the latest application before logging a follow-up.')
  return row
}
export async function deleteRow(userId, id, revision) {
  const row = checked(await table().delete().eq('user_id',userId).eq('id',id)
    .eq('updated_at',revision).select('id').maybeSingle())
  if (!row) throw new Error('This application has changed or was deleted. Refresh and review it.')
}
export async function deleteSamples(userId) {
  checked(await table().delete().eq('user_id',userId).eq('is_sample',true))
}
const closing = new Map()
export function watchRows(userId, changed, status) {
  let active = true
  let channel
  // The SDK reuses a channel by topic. Wait for a previous subscription to
  // finish leaving before binding handlers (including a Strict Mode remount).
  Promise.resolve(closing.get(userId)).then(() => {
    if (!active) return
    channel = db().channel('applications:' + userId, { config: { private: true } })
    for (const event of ['INSERT','UPDATE']) channel.on('postgres_changes', {
      event, schema: 'public', table: 'applications', filter: 'user_id=eq.' + userId,
    }, changed)
    channel.on('broadcast',{event:'removed'},changed).subscribe(state => { if (active) status(state) })
  }).catch(() => { if (active) status('CHANNEL_ERROR') })
  return () => {
    active = false
    if (!channel) return
    const done = db().removeChannel(channel).catch(() => {}).finally(() => {
      if (closing.get(userId) === done) closing.delete(userId)
    })
    closing.set(userId,done)
  }
}
export async function importRows(userId, rows) {
  return checked(await db().rpc('import_device_applications',{ expected_owner: userId, items: rows }))
}
export async function reminderSetting(userId) {
  return checked(await db().from('reminder_preferences').select('enabled,timezone').eq('user_id',userId).maybeSingle())
}
export async function setReminders(userId, enabled) {
  checked(await db().from('reminder_preferences').upsert({
    user_id:userId, enabled, timezone:Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  },{ onConflict:'user_id' }))
}
