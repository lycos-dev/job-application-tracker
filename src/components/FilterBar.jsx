import { TYPES } from '../lib/utils.js'
import Icon from './Icon.jsx'
export default function FilterBar({ query, setQuery, type, setType, due, setDue, count, view, setView, searchRef }) {
  return <div className="toolbar">
    <label className="search-box"><Icon name="search" size={16} /><input type="search" ref={searchRef}
      aria-label="Search applications" placeholder="Search applications…" value={query} onChange={e => setQuery(e.target.value)} /><kbd>/</kbd></label>
    <select aria-label="Filter by type" value={type} onChange={e => setType(e.target.value)}>
      <option value="">All types</option>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
    {(count > 0 || due) && <button className="chip" aria-pressed={due} onClick={() => setDue(!due)}>
      <Icon name="flag" size={15} />{count} to follow up</button>}
    <div className="views" aria-label="Tracker view">{['board','list'].map(v => <button key={v} aria-pressed={view === v}
      onClick={() => setView(v)}><Icon name={v} size={16} />{v}</button>)}</div>
  </div>
}
