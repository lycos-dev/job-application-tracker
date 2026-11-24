import { STAGES, deadlineBadge, shortDate, stageStyle } from '../lib/utils.js'
import { PostingLink, Priority, FollowUpAction } from './Card.jsx'
export default function ListView({ rows, actions, today }) {
  return <div className="list-wrap"><table><thead><tr>{['Priority','Company','Role','Type','Stage','Date','Link'].map(h =>
    <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map(row => {
    const due = deadlineBadge(row,today)
    return <tr key={row.id} className={actions.highlight === row.id ? 'just-saved' : ''} style={stageStyle(row.stage)}>
      <td data-label="Priority"><Priority row={row} onPin={actions.pin} /></td>
      <td data-label="Company"><button className="company" onClick={() => actions.edit(row)}>{row.company}</button></td>
      <td data-label="Role">{row.role || '—'}</td><td data-label="Type">{row.type}</td>
      <td data-label="Stage"><select className="stage-select" aria-label={'Stage for ' + row.company} value={row.stage}
        onChange={e => actions.move(row.id,e.target.value)}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></td>
      <td data-label="Date">{shortDate(row.applied_date || row.created_at.slice(0,10))}
        <FollowUpAction row={row} today={today} onFollow={actions.follow} />
        {due && <small className={'row-nudge ' + due.tone}>{due.text}</small>}</td>
      <td data-label="Link">{row.link ? <PostingLink link={row.link} /> : '—'}</td>
    </tr>
  })}</tbody></table></div>
}
