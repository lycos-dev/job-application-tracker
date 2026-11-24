import { Link } from 'react-router-dom'
import Brand from './Brand.jsx'
import Icon from './Icon.jsx'

export const tabs = {dashboard:'Dashboard',applications:'Applications','follow-ups':'Follow-ups',account:'Settings'}
const icons = {dashboard:'overview',applications:'board','follow-ups':'flag',account:'settings'}
export default function WorkspaceNav({active,pathFor,user,count,theme}){
  return <aside className="workspace-nav"><Link className="brand-link" to={pathFor('dashboard')}><Brand/></Link>
    <nav className="main-tabs" aria-label="Workspace">{Object.entries(tabs).map(([key,label]) =>
      <Link key={key} to={pathFor(key)} aria-current={active===key?'page':undefined} className="tab-link">
        <Icon name={icons[key]} /><span>{label}</span>{key==='follow-ups' && count>0 && <small>{count}</small>}
      </Link>)}</nav>
    <div className="workspace-identity"><Icon name="device"/><div><b>Personal workspace</b>
      <small>{user.email}</small></div></div>
    <button className="theme-control" title={'Theme: '+theme.mode} aria-label={'Theme: '+theme.mode+'. Change theme'} onClick={theme.cycle}>
      <Icon name="theme"/><span>Theme</span><small>{theme.mode}</small></button>
  </aside>
}
