import { spawnSync } from 'node:child_process'
import { createServer } from 'vite'

function cli(args) {
  // Capture status privately. It can contain credentials that Vite must never expose.
  const result=spawnSync('supabase',args,{encoding:'utf8',maxBuffer:8*1024*1024,windowsHide:true})
  if(result.error?.code==='ENOENT') throw Error('Install the Supabase CLI and start Docker Desktop, then run npm run dev:local again.')
  if(result.error || result.status!==0) throw Error('Supabase '+args[0]+' failed. Check Docker is running and run supabase '+args[0]+' from this folder for details.')
  return result.stdout
}

try {
  console.log('Starting your local Supabase project…')
  cli(['start'])
  cli(['migration','up','--local'])
  const entries=Object.fromEntries(cli(['status','-o','env']).split(/\r?\n/).flatMap(line=>{
    const match=/^([A-Z_]+)="?([^"]*)"?$/.exec(line.trim())
    return match?[[match[1],match[2]]]:[]
  }))
  const url=entries.API_URL, key=entries.PUBLISHABLE_KEY||entries.ANON_KEY
  if(!url||!key) throw Error('Supabase did not return its local API URL and public key. Update the CLI and retry.')
  process.env.VITE_SUPABASE_URL=url
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY=key
  process.env.VITE_SUPABASE_ANON_KEY=key
  console.log('Local confirmation and recovery inbox: '+(entries.MAILPIT_URL||entries.INBUCKET_URL||'http://127.0.0.1:54324'))
  const server=await createServer({server:{port:5173,strictPort:true}})
  await server.listen()
  server.printUrls()
} catch(e) { console.error(e.message); process.exitCode=1 }
