import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const dist = 'dist'
async function assets(dir) {
  const urls = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) urls.push(...await assets(path))
    else if (!entry.name.endsWith('.txt') && entry.name !== 'sw.js') urls.push(path)
  }
  return urls
}
const files = (await assets(dist)).sort()
const hash = createHash('sha256')
for (const file of files) hash.update(file).update(await readFile(file))
const version = hash.digest('hex').slice(0, 16)
const urls = files.map(path => '/' + relative(dist, path).split(sep).join('/'))
const worker = [
  'const prefix = "application-tracker.shell."',
  'const version = prefix + ' + JSON.stringify(version),
  'const assets = ' + JSON.stringify(urls),
  "self.addEventListener('install', event => {",
  "  event.waitUntil(caches.open(version).then(cache => cache.addAll(assets)))",
  "})",
  "self.addEventListener('activate', event => {",
  "  event.waitUntil(caches.keys().then(keys => Promise.all(",
  "    keys.filter(key => key.startsWith(prefix) && key !== version).map(key => caches.delete(key))",
  "  )).then(() => self.clients.claim()))",
  "})",
  "self.addEventListener('fetch', event => {",
  "  const url = new URL(event.request.url)",
  "  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return",
  "  const path = event.request.mode === 'navigate' ? '/index.html' : url.pathname",
  "  if (!assets.includes(path)) return",
  "  event.respondWith(caches.open(version).then(cache => cache.match(path)).then(hit => hit || fetch(event.request)))",
  "})",
].join('\n')
await writeFile(join(dist, 'sw.js'), worker)
