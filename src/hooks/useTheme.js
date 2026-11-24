import { useEffect, useState } from 'react'

const modes = ['system', 'dark', 'light']
const key = 'application-tracker.theme'
export function useTheme() {
  const [mode, setMode] = useState(() => {
    try { const value = localStorage.getItem(key); return modes.includes(value) ? value : 'system' }
    catch { return 'system' }
  })
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const theme = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode
      document.documentElement.dataset.theme = theme
      document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0a0c0f' : '#e8ebee'
    }
    apply()
    try { localStorage.setItem(key, mode) } catch { /* Theme still applies for this session. */ }
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [mode])
  function cycle() {
    const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const other = system === 'dark' ? 'light' : 'dark'
    setMode(current => current === 'system' ? other : current === other ? system : 'system')
  }
  return { mode, cycle }
}
