import { STAGES, stageStyle, shortDate, localDate } from '../lib/utils.js'
import Icon from '../components/Icon.jsx'
import {ActionRow} from '../components/Agenda.jsx'

export default function Dashboard({rows,items,openStage,openAgenda,edit,onSamples,onNew}){
  const recent = [...rows].sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).slice(0,4)
  const counts = STAGES.map(stage=>rows.filter(r=>r.stage===stage).length)
  return <div className="dashboard-grid">
    <section className="pipeline-summary"><div className="summary-head"><h2>Your pipeline</h2>
      <button onClick={()=>openStage('')} aria-label="View all applications"><Icon name="external"/></button></div>
      <div className="pipeline-total"><strong>{rows.length}</strong><span>tracked {rows.length===1?'opportunity':'opportunities'}</span></div>
      <div className="distribution" aria-hidden="true">{STAGES.map((s,i)=><i key={s} style={{...stageStyle(s),flex:counts[i]||0}}/>)}</div>
      <div className="stage-legend">{STAGES.map((s,i)=><button key={s} style={stageStyle(s)} onClick={()=>openStage(s)}
        aria-label={'View '+s+' applications'}><span><i/>{s}</span><b>{counts[i]}</b></button>)}</div>
    </section>
    <section className="surface next-up"><div className="section-top"><h2>Needs attention</h2><button className="text-action" onClick={openAgenda}>View all <Icon name="arrow" size={14}/></button></div>
      {items.length ? items.slice(0,3).map(item=><ActionRow key={item.row.id} item={item} edit={edit} compact/>) :
        <div className="quiet"><Icon name="check"/><h3>All caught up</h3><p>Deadlines and follow-ups will show up here when they’re due.</p></div>}
    </section>
    <section className="surface recent"><div className="section-top"><h2>Recently updated</h2>
      {!!rows.length && <button className="text-action" onClick={()=>openStage('')}>Applications <Icon name="arrow" size={14}/></button>}</div>
      {recent.length ? recent.map(row=><button className="recent-row" key={row.id} onClick={()=>edit(row)} style={stageStyle(row.stage)}>
        <span className="company-monogram">{row.company.trim().slice(0,1).toUpperCase()}</span>
        <span className="recent-name"><b>{row.company}</b><small>{row.role || row.type}</small></span>
        <span className="stage-label"><i/>{row.stage}</span>
        <span className="recent-date">{shortDate(localDate(new Date(row.updated_at)))}</span><Icon name="arrow" size={14}/>
      </button>) : <div className="first-entry"><h3>Start with your first opportunity</h3>
        <p>Log an application, or explore the dashboard with sample entries.</p>
        <div><button className="btn ghost" onClick={onNew}>Log an application</button><button className="text-action" onClick={onSamples}>Try with sample data</button></div>
      </div>}
    </section>
  </div>
}
