import { useEffect, useRef, useState } from 'react'
import { STAGES, stageStyle } from '../lib/utils.js'
function Count({ value }) {
  const [display,setDisplay] = useState(value)
  const current = useRef(value)
  useEffect(() => {
    const from = current.current
    if (from === value) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      current.current = value; setDisplay(value); return
    }
    const start = performance.now()
    let frame
    function tick(time) {
      const p = Math.min(1, (time - start) / 250)
      current.current = Math.round(from + (value - from) * (1 - (1 - p) ** 3))
      setDisplay(current.current)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  },[value])
  return <b aria-hidden="true">{display}</b>
}
export default function StageTiles({ rows, selected, onChange }) {
  return <section aria-label="Stage filters" className="tiles">{STAGES.map(stage => {
    const count = rows.filter(row => row.stage === stage).length
    return <button key={stage} className="tile" aria-pressed={selected === stage} style={stageStyle(stage)}
      aria-label={stage + ', ' + count + ' applications'} onClick={() => onChange(selected === stage ? '' : stage)}>
      <small>{stage}</small><Count value={count} /></button>
  })}</section>
}
