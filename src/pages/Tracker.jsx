import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApplications } from '../hooks/useApplications.js'
import { blank, followUp, localDate, quickFields, sortedRows } from '../lib/utils.js'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
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

export default function Tracker({ theme, user }) {
  const { rows, error, api, loading, pending, status } = useApplications(user?.id)
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
      if (e.key === '/') { e.preventDefault(); (search.current || quick.current?.querySelector('input'))?.focus() }
      if (e.key === 'n') { e.preventDefault(); setEditor(blank('Applied')) }
    }
    window.addEventListener('keydown',keydown)
    return () => window.removeEventListener('keydown',keydown)
  },[editor,moveId])
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
      reset(); setStage(target); setNotice(null)
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
  if (loading) return <LoadingSkeleton />
  return <main className="tracker">
    <header className="masthead"><div><p className="eyebrow">Jobs · Internships · Opportunities</p><h1>Application<br/>Tracker</h1></div>
      <div className="header-tools"><Link to={user ? '/account' : '/login'} className="device-link" aria-label="Account and workspace settings">
        <Icon name="device" size={16}/><span>{user ? 'My account' : 'On this device'}</span></Link>
        <button className="icon-button theme" aria-label={'Theme: ' + theme.mode + '. Change theme'} title={'Theme: ' + theme.mode}
          onClick={theme.cycle}><Icon name="theme" /></button></div></header>
    {user && <div className="sync-line" role="status"><i className={pending ? 'working' : status === 'Live' ? 'live' : ''}/>
      {pending ? 'Saving changes…' : error ? 'Sync needs attention' : status === 'Live' ? 'Live sync' : status}</div>}
    <StageTiles rows={rows} selected={stage} onChange={setStage} />
    <div ref={quick}><QuickAdd onNew={openNew} onQuick={async value => {
      const row = await api.add({ ...quickFields(value), stage:'Saved' })
      reset(); setEditor(row); setHighlight({id:row.id}); setNotice({text:'Saved for later.'})
    }} /></div>
    {error && <div className="note" role="alert">{error}<button onClick={api.refresh}>Retry</button></div>}
    {rows.length > 0 && <FilterBar query={query} setQuery={setQuery} type={type} setType={setType} due={due} setDue={setDue}
      count={rows.filter(row => followUp(row,today)).length} view={view} searchRef={search} setView={v => {
        setView(v); try { localStorage.setItem('application-tracker.view',v) } catch { /* Session preference remains active. */ }
      }} />}
    {(stage || type || due || term) && <div className="active-filters"><span>{visible.length} of {rows.length} shown</span>
      <button onClick={reset}>Clear filters</button></div>}
    {rows.some(row => row.is_sample) && <aside className="note"><span>You’re looking at sample data. Edit it or move a card to try the flow.</span>
      <button onClick={() => api.clearSamples().then(() => { reset(); setNotice({text:'Sample data cleared.'}) }).catch(showFailure)}>Clear sample data</button></aside>}
    {error && !rows.length ? null : !visible.length ? <EmptyState filtered={rows.length > 0} onNew={openNew} onReset={reset}
      onSamples={() => api.addSamples().then(reset).catch(showFailure)} /> :
      view === 'board' ? <Board rows={visible} stage={stage} actions={actions} today={today}/> :
      <ListView rows={visible} actions={actions} today={today}/>}
    <button className="fab" aria-label="Log application" onClick={openNew}><Icon name="plus" size={24}/></button>
    {editor && <EditorSheet key={editor.id || 'new'} initial={editor} onClose={() => setEditor(null)}
      onSave={async (id,fields) => {
        const stored = id ? await api.update(id,fields,editor.updated_at) : await api.add(fields)
        if (!id) reset()
        setHighlight({id:stored.id})
        setNotice({text:id ? 'Changes saved.' : 'Application logged.'})
      }} onDelete={async id => { await api.remove(id,editor.updated_at); setNotice({text:'Application deleted.'}) }} />}
    {moving && <MoveSheet row={moving} onMove={move} onClose={() => setMoveId(null)} />}
    <Toast notice={notice} onDismiss={dismiss}/>
  </main>
}
