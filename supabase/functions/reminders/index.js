import { timingSafeEqual } from 'node:crypto'

function authorized(request, secret) {
  if (!secret || secret.length < 32) return false
  const received = new TextEncoder().encode(request.headers.get('x-reminder-secret') || '')
  const expected = new TextEncoder().encode(secret)
  return received.length === expected.length && timingSafeEqual(received,expected)
}

export async function sendReminders(request, env, transport = fetch) {
  if (request.method !== 'POST') return new Response('Method not allowed',{status:405,headers:{Allow:'POST'}})
  if (!authorized(request,env('REMINDER_CRON_SECRET'))) return new Response('Unauthorized',{status:401})
  const url = env('SUPABASE_URL')
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  const resend = env('RESEND_API_KEY')
  const from = env('REMINDER_FROM')
  if (!url || !key || !resend || !from) return new Response('Missing function configuration',{status:503})
  async function rpc(name, args) {
    const response = await transport(url + '/rest/v1/rpc/' + name,{
      method:'POST', headers:{apikey:key,Authorization:'Bearer ' + key,'Content-Type':'application/json'},
      body:JSON.stringify(args), signal:AbortSignal.timeout(12000),
    })
    if (!response.ok) throw new Error('Database request failed')
    return response
  }
  let sent = 0
  let failed = 0
  try {
    const jobs = await (await rpc('claim_tracker_reminders',{})).json()
    for (const job of jobs) {
      try {
        const result = await transport('https://api.resend.com/emails',{
          method:'POST', headers:{Authorization:'Bearer ' + resend,'Content-Type':'application/json',
            'Idempotency-Key':'tracker/' + job.owner_id + '/' + job.mail_day},
          body:JSON.stringify({from,to:[job.recipient],subject:'Roleward™ application reminders · ' + job.mail_day,
            text:job.content + '\n\nManage email reminders in your Roleward account.'}),
          signal:AbortSignal.timeout(12000),
        })
        if (!result.ok) throw new Error('Email delivery failed')
        await rpc('ack_tracker_reminder',{owner_id:job.owner_id,day_sent:job.mail_day,token:job.token})
        sent++
      } catch {
        // Retain this lease for retry while allowing unrelated recipients to finish.
        failed++
      }
      if (sent + failed < jobs.length) await new Promise(resolve => setTimeout(resolve,600))
    }
    return Response.json({sent,failed,retry:failed > 0},{status:failed ? 503 : 200})
  } catch {
    // Keep the frozen digest and let the lease expire for the next scheduled retry.
    return Response.json({sent,retry:true},{status:503})
  }
}

if (typeof Deno !== 'undefined') Deno.serve(request => sendReminders(request,name => Deno.env.get(name)))
