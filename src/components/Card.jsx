import Icon from './Icon.jsx'
import { deadlineBadge, daysBetween, followUp, localDate, shortDate, stageStyle } from '../lib/utils.js'

export function PostingLink({ link }) {
  if (!link) return null
  let url
  try { url = new URL(link) } catch { return null }
  if (!['http:', 'https:'].includes(url.protocol)) return null
  return <a className="posting" href={url.href} target="_blank" rel="noopener noreferrer">
    <Icon name="external" size={14} />{url.hostname.replace(/^www\./, '')}</a>
}
export function FollowUpAction({ row, today, onFollow }) {
  if (followUp(row,today)) return <button className="apply" onClick={() => onFollow(row)}>Log follow-up</button>
  if (row.stage === 'Applied' && row.last_followed_up_at) return <small className="row-nudge">
    Followed up {shortDate(localDate(new Date(row.last_followed_up_at)))}</small>
  return null
}
export function Priority({ row, onPin }) {
  return <button type="button" className={'priority icon-button' + (row.pinned ? ' active' : '')}
    aria-label={'Priority for ' + row.company} aria-pressed={row.pinned} onClick={() => onPin(row)}>
    <Icon name="star" size={18} fill={row.pinned} /></button>
}
export default function Card({ row, actions, today, drag }) {
  const due = deadlineBadge(row, today)
  return <article data-card-id={row.id} className={'card' + (actions.highlight === row.id ? ' just-saved' : '') + (drag.isDragging ? ' dragging' : '')} ref={drag.setNodeRef}
    style={stageStyle(row.stage)} onClick={e => {
      if (!e.target.closest('button,a')) actions.edit(row)
    }}>
    <div className="card-head">
      <button className="company" onClick={() => actions.edit(row)}>{row.company}</button>
      <Priority row={row} onPin={actions.pin} />
    </div>
    <span className="position">{row.role || 'No role added'}</span>
    <div className="tags"><span>{row.type}</span>
      {row.applied_date && !['Saved','Closed'].includes(row.stage) && <span>{Math.max(0,daysBetween(row.applied_date,today))}d</span>}
      {due && <span className={due.tone}>{due.text}</span>}
      {followUp(row,today) && <span className="soon">⚑ Follow up</span>}
    </div>
    <PostingLink link={row.link} />
    {row.notes && <p className="card-notes">{row.notes}</p>}
    <FollowUpAction row={row} today={today} onFollow={actions.follow} />
    {row.stage === 'Saved' && <button className="apply" onClick={() => actions.apply(row)}>Mark as applied <Icon name="arrow" size={14} /></button>}
    <div className="card-foot">
      <button className="move" onClick={() => actions.pick(row)}>Move to…</button>
      <button className="handle icon-button" ref={drag.setActivatorNodeRef} {...drag.attributes} {...drag.listeners}
        aria-label={'Drag ' + row.company}><Icon name="grip" size={16}/></button>
    </div>
  </article>
}
