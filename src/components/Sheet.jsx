import { useEffect, useId, useRef } from 'react'
import Icon from './Icon.jsx'
export default function Sheet({ title, onClose, children, className = '' }) {
  const ref = useRef(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={ref} aria-labelledby={id} className={'sheet ' + className}
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => {
      if (event.target !== ref.current) return
      const rect = ref.current.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
    }}>
    <header className="sheet-head"><h2 id={id}>{title}</h2>
      <button className="icon-button" type="button" onClick={onClose} aria-label="Close sheet"><Icon name="x" /></button>
    </header>
    {children}
  </dialog>
}
