import { useLayoutEffect, useRef } from 'react'

// Keep a position within the scroll surface, so horizontal scrolling is not a move.
export function useCardMotion(ref, rows, stage, dragging) {
  const previous = useRef(new Map())
  useLayoutEffect(() => {
    const board = ref.current
    if (!board) return
    const bounds = board.getBoundingClientRect()
    const next = new Map()
    for (const el of board.querySelectorAll('[data-card-id]')) {
      const rect = el.getBoundingClientRect()
      const position = { x:rect.left - bounds.left + board.scrollLeft, y:rect.top - bounds.top }
      next.set(el.dataset.cardId,position)
      const before = previous.current.get(el.dataset.cardId)
      if (!before || dragging || !el.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) continue
      const dx = before.x - position.x, dy = before.y - position.y
      // Long jumps into other columns use the destination highlight.
      if ((Math.abs(dx) + Math.abs(dy) < 2) || Math.abs(dx) > 50 || Math.abs(dy) > 650) continue
      el.animate([{ translate: dx + 'px ' + dy + 'px' },{ translate:'0 0' }],
        {duration:220,easing:'cubic-bezier(.18,.66,.29,1)'})
    }
    previous.current = next
  },[ref,rows,stage,dragging])
}
