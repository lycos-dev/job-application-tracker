import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sendReminders } from '../supabase/functions/reminders/index.js'
const secret = 'test-only-example'.repeat(3)
const env = key => ({REMINDER_CRON_SECRET:secret,RESEND_API_KEY:'example',REMINDER_FROM:'test@example.test',
  SUPABASE_SERVICE_ROLE_KEY:'test-only',SUPABASE_URL:'https://test.invalid'})[key]
const request = token => new Request('https://test.invalid',{method:'POST',headers:{'x-reminder-secret':token}})
test('unauthorized requests cannot claim a batch',async () => {
  const result = await sendReminders(request('bad'),env,() => assert.fail())
  assert.equal(result.status,401)
})
test('provider failure leaves the digest unacknowledged; retries keep their idempotency key',async () => {
  const job = {owner_id:'a',mail_day:'2026-11-24',recipient:'me@example.test',token:'lease',content:'Apply by today'}
  const keys = []
  let acknowledgments = 0
  const transport = async (url,init) => {
    if (url.endsWith('/claim_tracker_reminders')) return Response.json([job])
    if (url.endsWith('/ack_tracker_reminder')) { acknowledgments++; return new Response(null,{status:204}) }
    keys.push(init.headers['Idempotency-Key'])
    return new Response(null,{status:keys.length === 1 ? 503 : 200})
  }
  assert.equal((await sendReminders(request(secret),env,transport)).status,503)
  assert.equal(acknowledgments,0)
  assert.equal((await sendReminders(request(secret),env,transport)).status,200)
  assert.equal(acknowledgments,1)
  assert.equal(keys[0],keys[1])
})

test('one rejected recipient does not hold up the next recipient',async () => {
  const make = owner_id => ({owner_id,mail_day:'2026-11-24',recipient:owner_id+'@example.test',token:'lease',content:'Due today'})
  const acks = []
  const result = await sendReminders(request(secret),env,async (url,init) => {
    if (url.endsWith('/claim_tracker_reminders')) return Response.json([make('one'),make('two')])
    if (url.endsWith('/ack_tracker_reminder')) {
      acks.push(JSON.parse(init.body).owner_id)
      return new Response(null,{status:204})
    }
    return new Response(null,{status:JSON.parse(init.body).to[0] === 'one@example.test' ? 422 : 200})
  })
  assert.equal(result.status,503)
  assert.deepEqual(acks,['two'])
})
