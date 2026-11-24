import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApplications } from '../hooks/useApplications.js'
import { blank, followUp, localDate, quickFields, sortedRows } from '../lib/utils.js'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import WorkspaceNav, { tabs } from '../components/WorkspaceNav.jsx'
import Dashboard from './Dashboard.jsx'
import Account from './Account.jsx'
import Agenda from '../components/Agenda.jsx'
import { nextActions } from '../lib/agenda.js'
import Board from '../components/Board.jsx'
import ListView from '../components/ListView.jsx'
import StageTiles from '../components/StageTiles.jsx'
import QuickAdd from '../components/QuickAdd.jsx'
import FilterBar from '../components/FilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Icon from '../components/Icon.jsx'
import Toast from '../components/Toast.jsx'
import EditorSheet from '../components/EditorSheet.jsx'
import MoveSheet from '../components/MoveSheet.jsx'

export default function Tracker({ theme, user, tab }) {
  const navigate = useNavigate()
  const focusAfterNav = useRef(false)
  const pathFor = useCallback(section => '/' + section,[])
  useEffect(() => {
    document.title = tabs[tab] + ' · Roleward™'
    window.scrollTo(0,0)
    if (tab==='applications' && focusAfterNav.current) {
      focusAfterNav.current=false
      const field=search.current || quick.current?.querySelector('input')
      field?.focus()
    }
  },[tab])
  const { rows, error, api, loading, pending, status } = useApplications(user.id)
  const [stage,setStage] = useState('')
  const [type,setType] = useState('')
  const [query,setQuery] = useState('')
  const [due,setDue] = useState(false)
  const [view,setView] = useState(() => {
    try { return localStorage.getItem('application-tracker.view') === 'list' ? 'list' : 'board' } catch { return 'board' }
  })
  const [editor,setEditor] = useState(null)
  const [moveId,setMoveId] = useState(null)
  const [notice,setNotice] = useState(null)
  const [highlight,setHighlight] = useState(null)
  const [today,setToday] = useState(localDate)
  const search = useRef(null)
  const quick = useRef(null)
  const dismiss = useCallback(() => setNotice(null),[])
  const openNew = () => setEditor(blank('Applied'))
  useEffect(() => {
    const update = () => setToday(localDate())
    const timer = setInterval(update, 30000)
    window.addEventListener('focus',update)
    return () => {clearInterval(timer); window.removeEventListener('focus',update)}
  },[])
  useEffect(() => {
    const keydown = e => {
      if (editor || moveId || e.isComposing || e.repeat || e.altKey || e.metaKey || e.ctrlKey ||
        e.target.closest('input,textarea,select,[contenteditable="true"]')) return
      if (e.key === '/') {
        e.preventDefault()
        if (tab !== 'applications') { focusAfterNav.current=true; navigate(pathFor('applications')) }
        else (search.current || quick.current?.querySelector('input'))?.focus()
      }
      if (e.key === 'n') { e.preventDefault(); setEditor(blank('Applied')) }
    }
    window.addEventListener('keydown',keydown)
    return () => window.removeEventListener('keydown',keydown)
  },[editor,moveId,tab,navigate,pathFor])
  useEffect(() => {
    if (!highlight) return
    const timeout = setTimeout(() => setHighlight(null),1200)
    return () => clearTimeout(timeout)
  },[highlight])
  function reset() { setStage(''); setType(''); setQuery(''); setDue(false) }
  function showFailure(err) { setNotice({text:err.message,error:true}) }
  async function move(id, target) {
    await api.update(id,{stage:target})
    setHighlight({id})
    setNotice({text:'Moved to ' + target + '.', action:'Show stage', onAction:() => {
      openStage(target); setNotice(null)
    }})
  }
  const actions = { highlight:highlight?.id, edit:setEditor, pick:row => setMoveId(row.id),
    move:(id,target) => move(id,target).catch(showFailure),
    apply:row => move(row.id,'Applied').catch(showFailure),
    follow:row => api.recordFollowUp(row.id,row.updated_at).then(() => {
      setHighlight({id:row.id}); setNotice({text:'Follow-up recorded for ' + row.company + '.'})
    }).catch(showFailure),
    pin:row => api.update(row.id,{pinned:!row.pinned}).catch(showFailure) }
  const term = query.trim().toLocaleLowerCase()
  const visible = sortedRows(rows.filter(row => (!stage || row.stage === stage) && (!type || row.type === type) &&
    (!due || followUp(row,today)) && [row.company,row.role,row.notes,row.location].join(' ').toLocaleLowerCase().includes(term)))
  const moving = rows.find(row => row.id === moveId)
  const items = nextActions(rows,today)
  const samples = rows.some(row=>row.is_sample)
  function openStage(value) { reset(); setStage(value); navigate(pathFor('applications')) }
  const trySamples = () => api.addSamples().then(reset).catch(showFailure)
  const clearSamples = () => api.clearSamples().then(() => { reset(); setNotice({text:'Sample data cleared.'}) }).catch(showFailure)
  if (loading) return <LoadingSkeleton />
  return <div className="workspace"><WorkspaceNav active={tab} pathFor={pathFor} user={user} count={items.length} theme={theme}/>
    <main className="workspace-main"><header className="page-head"><div>
      <p className="page-date">{new Date(today+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</p>
      <h1>{tabs[tab]}</h1></div>
      {tab!=='account' && <button className="btn global-add" onClick={openNew}><Icon name="plus" size={17}/>Log application</button>}
    </header>
    {user && <div className="sync-line" role="status"><i className={pending ? 'working' : status === 'Live' ? 'live' : ''}/>
      {pending ? 'Saving changes…' : error ? 'Sync needs attention' : status === 'Live' ? 'Live sync' : status}</div>}
    {error && <div className="note" role="alert">{error}<button onClick={api.refresh}>Retry</button></div>}
    <div className="page-content" key={tab}>
    {tab==='dashboard' && <Dashboard rows={rows} items={items} openStage={openStage} openAgenda={()=>navigate(pathFor('follow-ups'))}
      edit={setEditor} onSamples={trySamples} onNew={openNew}/>}
    {tab==='follow-ups' && <Agenda items={items} actions={actions}/>}
    {tab==='account' && <div className="settings-stack"><Account user={user}/>
      <section className="surface settings-panel"><h2>Appearance</h2><button className="soft-button" onClick={theme.cycle}>Theme · {theme.mode}</button></section>
      {(samples || !rows.length) && <section className="surface settings-panel"><h2>Sample applications</h2>
        <button className="soft-button" onClick={samples ? clearSamples : trySamples}>{samples?'Clear sample data':'Try with sample data'}</button></section>}</div>}
    {tab==='applications' && <>
    <StageTiles rows={rows} selected={stage} onChange={setStage} />
    <div ref={quick}><QuickAdd onQuick={async value => {
      const row = await api.add({ ...quickFields(value), stage:'Saved' })
      reset(); setEditor(row); setHighlight({id:row.id}); setNotice({text:'Saved for later.'})
    }} /></div>
    {rows.length > 0 && <FilterBar query={query} setQuery={setQuery} type={type} setType={setType} due={due} setDue={setDue}
      count={rows.filter(row => followUp(row,today)).length} view={view} searchRef={search} setView={v => {
        setView(v); try { localStorage.setItem('application-tracker.view',v) } catch { /* Session preference remains active. */ }
      }} />}
    {(stage || type || due || term) && <div className="active-filters"><span>{visible.length} of {rows.length} shown</span>
      <button onClick={reset}>Clear filters</button></div>}
    {samples && <div className="sample-line"><span>Includes sample applications</span><button onClick={clearSamples}>Clear sample data</button></div>}
    {error && !rows.length ? null : !visible.length ? <EmptyState filtered={rows.length > 0} onNew={openNew} onReset={reset}
      onSamples={() => api.addSamples().then(reset).catch(showFailure)} /> :
      view === 'board' ? <Board rows={visible} stage={stage} actions={actions} today={today}/> :
      <ListView rows={visible} actions={actions} today={today}/>}
    </>}</div>
    {tab!=='account' && <button className="fab" aria-label="Log application" onClick={openNew}><Icon name="plus" size={24}/></button>}
    {editor && <EditorSheet key={editor.id || 'new'} initial={editor} onClose={() => setEditor(null)}
      onSave={async (id,fields) => {
        const stored = id ? await api.update(id,fields,editor.updated_at) : await api.add(fields)
        if (!id) reset()
        setHighlight({id:stored.id})
        setNotice({text:id ? 'Changes saved.' : 'Application logged.'})
      }} onDelete={async id => { await api.remove(id,editor.updated_at); setNotice({text:'Application deleted.'}) }} />}
    {moving && <MoveSheet row={moving} onMove={move} onClose={() => setMoveId(null)} />}
    <Toast notice={notice} onDismiss={dismiss}/>
  </main></div>
}
