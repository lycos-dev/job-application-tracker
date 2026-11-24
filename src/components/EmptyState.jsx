import Icon from './Icon.jsx'
export default function EmptyState({ filtered, onNew, onSamples, onReset }) {
  return <section className="empty">
    <span className="empty-icon"><Icon name={filtered ? 'search' : 'folder'} size={29} /></span>
    <h2>{filtered ? 'No matching applications' : 'Nothing tracked yet'}</h2>
    <p>{filtered ? 'Try another search or clear the active filters.' :
      'Save roles you might want, log the ones you’ve applied to, and keep every link and note in one place.'}</p>
    <div className="empty-actions">{filtered ? <button className="btn ghost" onClick={onReset}>Clear filters</button> : <>
      <button className="btn" onClick={onNew}><Icon name="plus" size={16}/>Log an application</button>
      <button className="btn ghost" onClick={onSamples}>Try with sample data</button></>}</div>
  </section>
}
