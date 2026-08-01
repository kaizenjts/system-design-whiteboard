import { SimulatorCanvas } from '../canvas/SimulatorCanvas'
import { useDiagramAutoSave } from '../persistence/useDiagramAutoSave'
import { MODES } from '../domain/types'
import { CoreLoopTour } from '../ui/CoreLoopTour'
import { DiagramActions } from '../ui/DiagramActions'
import { FailurePanel } from '../ui/FailurePanel'
import { FindingsPanel } from '../ui/FindingsPanel'
import { Inspector } from '../ui/Inspector'
import { Palette } from '../ui/Palette'
import { SessionContext } from '../ui/SessionContext'
import { TrafficPanel } from '../ui/TrafficPanel'
import { useAppStore } from './store'

export function App() {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  useDiagramAutoSave()

  return (
    <div className="app-shell">
      <div className="app-top">
        <header className="app-header">
          <div className="brand">
            <span className="brand-mark">SDS</span>
            <h1>System Design Simulator</h1>
          </div>
          <SessionContext />
          <div className="header-controls">
            <DiagramActions />
            <nav className="mode-switcher" aria-label="Simulator mode">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={mode === m.id ? 'mode-btn active' : 'mode-btn'}
                  title={m.hint}
                  aria-label={`${m.label}: ${m.hint}`}
                  data-tour={`mode-${m.id}`}
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </nav>
          </div>
        </header>
        <CoreLoopTour />
      </div>

      <main className={mode === 'design' ? 'app-main' : 'app-main app-main-sim'}>
        <Palette />
        <SimulatorCanvas />
        {mode === 'health' ? (
          <FindingsPanel />
        ) : mode === 'traffic' ? (
          <TrafficPanel />
        ) : mode === 'failure' ? (
          <FailurePanel />
        ) : (
          <Inspector />
        )}
      </main>
    </div>
  )
}
