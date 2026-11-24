import { useRef, useState } from 'react'
import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, pointerWithin,
  rectIntersection, useSensor, useSensors } from '@dnd-kit/core'
import { STAGES, stageStyle } from '../lib/utils.js'
import { useCardMotion } from '../hooks/useCardMotion.js'
import Column from './Column.jsx'

function collision(args) { return args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args) }
export default function Board({ rows, stage, actions, today }) {
  const rail = useRef(null)
  const [tab, setTab] = useState('Saved')
  const [dragged, setDragged] = useState(null)
  useCardMotion(rail,rows,stage,Boolean(dragged))
  const sensors = useSensors(useSensor(MouseSensor,{activationConstraint:{distance:5}}),
    useSensor(TouchSensor,{activationConstraint:{delay:280,tolerance:8}}),useSensor(KeyboardSensor))
  const stages = stage ? [stage] : STAGES
  const active = rows.find(row => row.id === dragged)
  function jump(name) {
    const el = rail.current.querySelector('[data-column="' + name + '"]')
    if (el) rail.current.scrollTo({ left: el.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <DndContext sensors={sensors} collisionDetection={collision}
    onDragStart={e => setDragged(e.active.id)} onDragCancel={() => setDragged(null)}
    onDragEnd={e => {
      setDragged(null)
      if (e.over && active && e.over.id !== active.stage) actions.move(active.id, e.over.id)
    }}>
    {!stage && <nav aria-label="Jump to stage" className="stage-nav">{stages.map(name =>
      <button key={name} className={tab === name ? 'selected' : ''} onClick={() => jump(name)} style={stageStyle(name)}>{name}</button>)}</nav>}
    <div className="board" ref={rail} onScroll={() => {
      const el = rail.current
      const nearest = [...el.children].reduce((best, child) =>
        Math.abs(child.offsetLeft - el.scrollLeft) < Math.abs(best.offsetLeft - el.scrollLeft) ? child : best)
      setTab(nearest.dataset.column)
    }}>{stages.map(name => <Column key={name} stage={name} rows={rows.filter(row => row.stage === name)}
      actions={actions} today={today} />)}</div>
    <DragOverlay>{active && <div className="drag-preview" style={stageStyle(active.stage)}><b>{active.company}</b><small>{active.role}</small></div>}</DragOverlay>
  </DndContext>
}
