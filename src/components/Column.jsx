import { useDraggable, useDroppable } from '@dnd-kit/core'
import Card from './Card.jsx'
import { stageStyle } from '../lib/utils.js'

function DraggableCard(props) {
  const drag = useDraggable({ id: props.row.id })
  return <Card {...props} drag={drag} />
}
export default function Column({ stage, rows, actions, today }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return <section ref={setNodeRef} data-column={stage} aria-label={stage + ' column'}
    className={'column' + (isOver ? ' over' : '')} style={stageStyle(stage)}>
    <h2>{stage}<small>{rows.length}</small></h2>
    <div className="cards">{rows.length ? rows.map(row => <DraggableCard key={row.id} row={row} actions={actions} today={today} />)
      : <div className="dropzone">Drop here</div>}</div>
  </section>
}
