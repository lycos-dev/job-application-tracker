import { useState } from 'react'
import Icon from './Icon.jsx'

export function ActionRow({item,edit,follow,compact=false}) {
  const {row,kind,label} = item
  return <div className={'action-row '+kind}>
    <span className="action-symbol"><Icon name={kind==='deadline'?'calendar':'flag'}/></span>
    <button className="row-title" onClick={()=>edit(row)}><b>{row.company}</b><small>{label}</small></button>
    {!compact && kind==='follow' ? <button className="soft-button" onClick={()=>follow(row)}>Log follow-up</button> :
      <button className="row-arrow" aria-label={'Open '+row.company} onClick={()=>edit(row)}><Icon name="arrow" size={16}/></button>}
  </div>
}
export default function Agenda({items,actions}){
  const [filter,setFilter] = useState('all')
  const shown = items.filter(item=>filter==='all'||item.kind===filter)
  return <section className="surface agenda"><div className="section-top"><h2>Action queue</h2></div>
    <div className="queue-tabs" aria-label="Action type">{[['all','All'],['follow','Follow-ups'],['deadline','Deadlines']].map(([key,label])=>
      <button key={key} aria-pressed={key===filter} onClick={()=>setFilter(key)}>{label}</button>)}</div>
    {shown.map(item=><ActionRow key={item.row.id} item={item} edit={actions.edit} follow={actions.follow}/>)}
    {!shown.length && <div className="quiet"><Icon name="check"/><h3>You’re caught up</h3>
      <p>{filter==='follow'?'Applications appear here after ten days without activity.':filter==='deadline'?'No overdue or upcoming deadlines in the next seven days.':'Upcoming deadlines and applications due for a follow-up will appear here.'}</p></div>}
  </section>
}
