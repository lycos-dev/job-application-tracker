import { useEffect } from 'react'
import Icon from './Icon.jsx'
export default function Toast({ notice, onDismiss }) {
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(onDismiss, notice.error || notice.action ? 7000 : 3500)
    return () => clearTimeout(timer)
  },[notice,onDismiss])
  return notice && <div className={'toast' + (notice.error ? ' failed' : '')} role={notice.error ? 'alert' : 'status'}>
    <span>{notice.text}</span>{notice.action && <button className="toast-action" onClick={notice.onAction}>{notice.action}</button>}<button className="icon-button" aria-label="Dismiss message" onClick={onDismiss}><Icon name="x" size={16}/></button>
  </div>
}
