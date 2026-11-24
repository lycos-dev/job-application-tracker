import { useState } from 'react'
import { STAGES, stageStyle } from '../lib/utils.js'
import Sheet from './Sheet.jsx'
import Icon from './Icon.jsx'
export default function MoveSheet({ row, onMove, onClose }) {
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  return <Sheet title={'Move ' + row.company} onClose={onClose} className="move-sheet">
    <div className="sheet-body stage-options">{STAGES.map(stage =>
      <button key={stage} disabled={busy || stage === row.stage} className="stage-option" style={stageStyle(stage)}
        onClick={async () => {
          setBusy(true)
          try { await onMove(row.id,stage); onClose() } catch(e) { setError(e.message); setBusy(false) }
        }}><span className="dot" />{stage}{stage === row.stage && <Icon name="check" />}</button>)}
      {error && <p role="alert" className="error">{error}</p>}
    </div>
  </Sheet>
}
